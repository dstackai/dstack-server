import json
from abc import ABC, abstractmethod
from typing import Dict, Optional, IO, Tuple

import requests

import dstack.logger as log
from dstack.config import Profile
from dstack.content import Content


class MatchError(ValueError):
    def __init__(self, params: Dict):
        self.params = params

    def __str__(self):
        return f"Can't match parameters {self.params}"


class StackNotFoundError(ValueError):
    def __init__(self, stack: str):
        self.stack = stack

    def __str__(self):
        return f"Stack {self.stack} not found"


class Protocol(ABC):
    @abstractmethod
    def push(self, stack: str, token: str, data: Dict) -> Dict:
        pass

    @abstractmethod
    def access(self, stack: str, token: str) -> Dict:
        pass

    @abstractmethod
    def pull(self, stack: str, token: Optional[str], params: Optional[Dict]) -> Tuple[str, int, Dict]:
        pass

    @abstractmethod
    def download(self, url) -> (IO, int):
        pass


class JsonProtocol(Protocol):
    ENCODING = "utf-8"
    MAX_SIZE = 5_000_000

    def __init__(self, url: str, verify: bool):
        self.url = url
        self.verify = verify

    def push(self, stack: str, token: str, data: Dict) -> Dict:
        data["stack"] = stack

        if self.length(data) < self.MAX_SIZE:
            for attach in data.get("attachments", []):
                attach["data"] = attach["data"].base64value()

            result = self.do_request("/stacks/push", data, token)
        else:
            content = []

            for attach in data["attachments"]:
                d = attach.pop("data")
                content.append(d)
                attach["length"] = d.length()

            result = self.do_request("/stacks/push", data, token)

            for attach in result["attachments"]:
                self.do_upload(attach["upload_url"], content[attach["index"]])

        return result

    def access(self, stack: str, token: str) -> Dict:
        return self.do_request("/stacks/access", {"stack": stack}, token)

    def pull(self, stack: str, token: Optional[str], params: Optional[Dict]) -> Tuple[str, int, Dict]:
        empty = params is None
        params = {} if empty else params
        url = f"/stacks/{stack}"
        res = self.do_request(url, None, token=token, method="GET", stack=stack)
        attachments = res["stack"]["head"]["attachments"]
        for index, attach in enumerate(attachments):
            if (len(attachments) == 1 and empty) or set(attach["params"].items()) == set(params.items()):
                frame = res["stack"]["head"]["id"]
                attach_url = f"/attachs/{stack}/{frame}/{index}?download=true"
                return frame, index, self.do_request(attach_url, None, token=token, method="GET")
        raise MatchError(params)

    def do_request(self, endpoint: str, data: Optional[Dict],
                   token: Optional[str], method: str = "POST", stack: Optional[str] = None) -> Dict:
        url = self.url + endpoint

        event_id = log.uuid()
        log.debug(event_id=event_id, func=log.erase_sensitive_data, url=url, method=method, data=data)

        headers = {}
        if token is not None:
            headers["Authorization"] = f"Bearer {token}"
        if data is None:
            response = requests.request(method=method, url=url,
                                        headers=headers, verify=self.verify)
        else:
            data_bytes = json.dumps(data).encode(self.ENCODING)
            headers["Content-Type"] = f"application/json; charset={self.ENCODING}"
            response = requests.request(method=method, url=url, data=data_bytes,
                                        headers=headers, verify=self.verify)

        log.debug(event_id=event_id, func=log.erase_token, request_headers=response.request.headers)
        log.debug(event_id=event_id, func=log.ensure_json_serialization, response_headers=response.headers)

        if response.status_code != 200:
            # FIXME: parse content
            log.debug(event_id=event_id, response_body=str(response.content))

        if stack and response.status_code == 404:
            raise StackNotFoundError(stack)

        response.raise_for_status()

        return response.json()

    def download(self, url) -> (IO, int):
        r = requests.get(url, stream=True, verify=self.verify)

        log.debug(func=log.ensure_json_serialization, url=url, reponse_headers=r.headers)

        return r.raw, int(r.headers['Content-length'])

    def do_upload(self, upload_url: str, data: Content):
        event_id = log.uuid()
        log.debug(event_id=event_id, url=upload_url, length=data.length())

        response = requests.put(url=upload_url, data=data.stream(), verify=self.verify)

        log.debug(event_id=event_id, func=log.ensure_json_serialization, request_headers=response.request.headers)
        log.debug(event_id=event_id, func=log.ensure_json_serialization, response_headers=response.headers)

        response.raise_for_status()

    def length(self, data: Dict) -> int:
        memo = []
        attachments_length = 0

        for attach in data.get("attachments", []):
            d = attach.pop("data")
            attachments_length += d.base64length() + len("data") + 8
            memo.append(d)

        length_without_data = len(json.dumps(data).encode(self.ENCODING))

        for index, attach in enumerate(data.get("attachments", [])):
            attach["data"] = memo[index]

        return length_without_data + attachments_length


class ProtocolFactory(ABC):
    @abstractmethod
    def create(self, profile: Profile) -> Protocol:
        pass


class JsonProtocolFactory(ProtocolFactory):
    def create(self, profile: Profile) -> Protocol:
        return JsonProtocol(profile.server, profile.verify)


__protocol_factory = JsonProtocolFactory()


def setup_protocol(protocol_factory: ProtocolFactory):
    global __protocol_factory
    __protocol_factory = protocol_factory


def create_protocol(profile: Profile) -> Protocol:
    return __protocol_factory.create(profile)
