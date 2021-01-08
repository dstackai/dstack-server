from typing import Any

from dstack.handler import Encoder, EncoderFactory


class Markdown:
    def __init__(self, text: str):
        self.text = text


class MarkdownEncoderFactory(EncoderFactory):

    def accept(self, obj: Any) -> bool:
        return self.is_type(obj, "dstack.markdown.Markdown")

    def create(self) -> Encoder[Any]:
        from dstack.markdown.handlers import MarkdownEncoder
        return MarkdownEncoder()
