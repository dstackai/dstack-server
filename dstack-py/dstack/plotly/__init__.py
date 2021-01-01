from typing import Any

from dstack.handler import Encoder, EncoderFactory


class PlotlyEncoderFactory(EncoderFactory):

    def accept(self, obj: Any) -> bool:
        return self.is_type(obj, "plotly.graph_objs._figure.Figure")

    def create(self) -> Encoder:
        from dstack.plotly.handlers import PlotlyEncoder
        return PlotlyEncoder()
