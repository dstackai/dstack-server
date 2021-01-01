from json import dumps
from typing import Optional, Dict

from bokeh import __version__ as bokeh_version
from bokeh.embed import json_item
from bokeh.plotting import Figure

from dstack import BytesContent, Encoder
from dstack.content import MediaType
from dstack.stack import FrameData


class BokehEncoder(Encoder[Figure]):
    """Bokeh's Figure encoder.
    Notes:
        In the settings section it stores Bokeh library version as `bokeh_version`.
    """

    def encode(self, obj: Figure, description: Optional[str], params: Optional[Dict]) -> FrameData:
        """Convert Bokeh figure to frame data.

        Args:
            obj (bokeh.plotting.figure.Figure): Bokeh's figure to publish.
            description: Bokeh plot description.
            params: Bokeh plot parameters.

        Returns:
            Frame data.
        """
        text = dumps(json_item(obj))
        return FrameData(BytesContent(text.encode("utf-8")),
                         MediaType("application/json", "bokeh"),
                         description, params, {"bokeh_version": bokeh_version})
