from typing import Any

from dstack.handler import Encoder, EncoderFactory


class MatplotlibEncoderFactory(EncoderFactory):

    def accept(self, obj: Any) -> bool:
        return self.is_type(obj, "matplotlib.figure.Figure")

    def create(self) -> Encoder[Any]:
        from dstack.matplotlib.handlers import MatplotlibEncoder
        return MatplotlibEncoder()
