import io
from typing import Dict, Optional

from matplotlib.figure import Figure

from dstack import BytesContent, Encoder
from dstack.content import MediaType
from dstack.stack import FrameData


class MatplotlibEncoder(Encoder[Figure]):
    """Handler to deal with matplotlib charts."""

    def encode(self, obj: Figure, description: Optional[str], params: Optional[Dict]) -> FrameData:
        """Convert matplotlib figure to frame data.

        Notes:
            Figure will be converted to SVG format.

        Args:
            obj: Plot to be published.
            description: Description of the plot.
            params: Plot parameters if specified.

        Returns:
            Corresponding `FrameData` object.
        """
        buf = io.BytesIO()
        obj.savefig(buf, format="svg")
        return FrameData(BytesContent(buf), MediaType("image/svg+xml", "matplotlib"), description, params)
