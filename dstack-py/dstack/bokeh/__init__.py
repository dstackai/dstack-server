from typing import Any

from dstack.handler import Encoder, EncoderFactory


class BokehEncoderFactory(EncoderFactory):

    def accept(self, obj: Any) -> bool:
        return self.is_type(obj, "bokeh.plotting.figure.Figure")

    def create(self) -> Encoder:
        from dstack.bokeh.handlers import BokehEncoder
        return BokehEncoder()
