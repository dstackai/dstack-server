from typing import Dict, Optional

from plotly import __version__ as plotly_version
from plotly.graph_objs._figure import Figure

from dstack.content import BytesContent
from dstack.content import MediaType
from dstack.handler import Encoder
from dstack.stack import FrameData


class PlotlyEncoder(Encoder[Figure]):
    """A class to handle Plotly charts.

    Notes:
        Handler stores Plotly version in settings part of the frame data.
    """

    def __init__(self, plotly_js_version: Optional[str] = None):
        """Create an instance with specified Plotly.js version if needed.

        Args:
            plotly_js_version: Plotly.js version to use. It will be stored in the settings
            part of frame data.
        """
        super().__init__()
        self.plotly_js_version = plotly_js_version

    def encode(self, obj: Figure, description: Optional[str], params: Optional[Dict]) -> FrameData:
        """Build frame data object from Plotly figure.

        Args:
            obj (plotly.graph_objs._figure.Figure): A plotly figure to publish.
            description: Description of Plotly chart.
            params: Parameters of the chart.

        Returns:
            Frame data.
        """
        json = obj.to_json()
        return FrameData(BytesContent(json.encode("utf-8")),
                         MediaType("application/json", "plotly"),
                         description, params,
                         {"plotly_version": plotly_version, "plotly_js_version": self.plotly_js_version})
