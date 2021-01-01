import time
from abc import ABC, abstractmethod
from platform import uname
from sys import version as python_version
from typing import Dict, List, Optional, Any
from uuid import uuid4

from deprecation import deprecated

from dstack import AutoHandler, Context
from dstack.handler import FrameData, Encoder
from dstack.version import __version__ as dstack_version


class EncryptionMethod(ABC):
    @abstractmethod
    def encrypt(self, frame: FrameData) -> FrameData:
        pass

    @abstractmethod
    def info(self) -> Dict:
        pass


class NoEncryption(EncryptionMethod):
    def encrypt(self, frame: FrameData) -> FrameData:
        return frame

    def info(self) -> Dict:
        return {}


class PushResult(object):
    def __init__(self, frame_id: str, url: str):
        self.id = frame_id
        self.url = url

    def __repr__(self) -> str:
        return self.url

    def _repr_javascript_(self):
        return """ 
        var url = '%s';
        var img = document.createElement('img')
        img.src = 'https://dstack.ai/favicon.ico'
        img.width = '24'
        img.height = '24'
        img.alt = ''
        img.style = 'float:left; display: inline-block; margin-right: 5px;'
        element.append(img)
        var a = document.createElement('a');
        a.style = 'float:clear; display: inline-block; margin-top: 3px; text-decoration: underline'
        var text = document.createElement('pre');
        text.innerHTML = url;
        a.appendChild(text);
        a.target = '_blank';
        a.href = url;
        element.append(a);
        """ % self.url


class FrameMeta(object):
    def __init__(self, data: Optional[Dict] = None, **kwargs):
        self.data = merge_or_none(data, kwargs) or {}


class StackFrame(object):
    def __init__(self,
                 context: Context,
                 access: Optional[str],
                 auto_push: bool,
                 encryption: EncryptionMethod):
        self.access = access
        self.auto_push = auto_push
        self.context = context
        self.encryption_method = encryption
        self.id = uuid4().__str__()
        self.index = 0
        self.timestamp = int(round(time.time() * 1000))  # milliseconds
        self.data: List[FrameData] = []

    @deprecated(details="Use add instead")
    def commit(self,
               obj: Any,
               description: Optional[str] = None,
               params: Optional[Dict] = None,
               encoder: Optional[Encoder[Any]] = None,
               **kwargs):
        """Add data to the stack frame.

        Args:
            obj: A data to commit. Data will be preprocessed by the handler but dependently on auto_push
                mode will be sent to server or not. If auto_push is False then the data won't be sent.
                Explicit push call need anyway to process committed data. auto_push is useful only in the
                case of multiple data objects in the stack frame, e.g. set of plots with settings.
            description: Description of the data.
            params: Parameters associated with this data, e.g. plot settings.
            encoder: Handler to use, by default it is AutoHandler.
            **kwargs: Optional parameters is an alternative to params. If both are present this one will
                be merged into params.
        """
        self.add(obj, description, params, encoder, **kwargs)

    def add(self,
            obj: Any,
            description: Optional[str] = None,
            params: Optional[Dict] = None,
            encoder: Optional[Encoder[Any]] = None,
            **kwargs):
        """Add data to the stack frame.

        Args:
            obj: A data to commit. Data will be preprocessed by the handler but dependently on auto_push
                mode will be sent to server or not. If auto_push is False then the data won't be sent.
                Explicit push call need anyway to process committed data. auto_push is useful only in the
                case of multiple data objects in the stack frame, e.g. set of plots with settings.
            description: Description of the data.
            params: Parameters associated with this data, e.g. plot settings.
            encoder: Handler to use, by default it is AutoHandler.
            **kwargs: Optional parameters is an alternative to params. If both are present this one will
                be merged into params.
        """
        encoder = encoder or AutoHandler()
        encoder.set_context(self.context)
        params = merge_or_none(params, kwargs)
        data = encoder.encode(obj, description, params)
        encrypted_data = self.encryption_method.encrypt(data)
        self.data.append(encrypted_data)

        if self.auto_push:
            self.push_data(encrypted_data)

    def push(self, meta: Optional[FrameMeta] = None) -> PushResult:
        """Push all data to server. In the case of auto_push mode it sends only a total number
        of elements in the frame. So call this method is obligatory to close frame anyway.

        Args:
            meta: A message associated with this revision.
        Returns:
            Stack URL.
        """
        frame = self.new_frame()

        if meta:
            frame["params"] = meta.data

        if not self.auto_push:
            frame["attachments"] = [filter_none(x.__dict__) for x in self.data]
            return self.send_push(frame)
        else:
            frame["size"] = self.index
            return self.send_push(frame)

    def push_data(self, data: FrameData):
        frame = self.new_frame()
        frame["index"] = self.index
        frame["attachments"] = [filter_none(data.__dict__)]
        self.index += 1
        self.send_push(frame)

    def new_frame(self) -> Dict:
        data = {"id": self.id,
                "timestamp": self.timestamp,
                "client": "dstack-py",
                "version": dstack_version,
                "settings": self.settings()}

        if not isinstance(self.encryption_method, NoEncryption):
            data["encryption"] = self.encryption_method.info()

        if self.access:
            data["access"] = self.access

        return data

    def send_access(self):
        self.context.protocol.access(self.context.stack_path(), self.context.profile.token)

    def send_push(self, frame: Dict) -> PushResult:
        res = self.context.protocol.push(self.context.stack_path(), self.context.profile.token, frame)
        return PushResult(self.id, res["url"])

    @staticmethod
    def settings():
        info = uname()
        return {"python": python_version,
                "os": {
                    "sysname": info[0],
                    "release": info[2],
                    "version": info[3],
                    "machine": info[4]
                }}


def filter_none(d):
    if isinstance(d, Dict):
        return {k: filter_none(v) for k, v in d.items() if v is not None}
    return d


def merge_or_none(x: Optional[Dict], y: Optional[Dict]) -> Optional[Dict]:
    x = {} if x is None else x.copy()
    x.update(y)
    return None if len(x) == 0 else x
