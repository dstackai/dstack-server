import base64
import copy
import json
from unittest import TestCase

from dstack import JsonProtocol, BytesContent


class TestJsonProtocol(TestCase):
    def test_data_base64_length(self):
        def test_b64(s: str):
            buf = s.encode("UTF-8")
            data = BytesContent(buf)
            self.assertEqual(len(base64.b64encode(buf)), data.base64length())

        tests = ["hello world", "привет мир!"]
        for t in tests:
            test_b64(t)

    def test_length(self):
        def b64(d):
            d["data"] = base64.b64encode(d["data"].value()).decode()

        def length(d) -> int:
            x = copy.deepcopy(d)
            for attach in x["attachments"]:
                b64(attach)
            return len(json.dumps(x).encode(protocol.ENCODING))

        data = {
            "name": "my name",
            "x": 10,
            "attachments": [
                {
                    "data": BytesContent(b"test test"),
                    "hello": "world"
                },
                {
                    "data": BytesContent(b"hello world"),
                    "hello": "world"
                }
            ]
        }
        protocol = JsonProtocol("http://myhost", True)
        self.assertEqual(protocol.length(data), length(data))
