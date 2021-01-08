from typing import Dict, Optional

from dstack import BytesContent, Encoder
from dstack.content import MediaType
from dstack.stack import FrameData
from dstack.markdown import Markdown


class MarkdownEncoder(Encoder[Markdown]):
    def encode(self, obj: Markdown, description: Optional[str], params: Optional[Dict]) -> FrameData:
        return FrameData(BytesContent(obj.text.encode("utf-8")), MediaType("text/markdown", "markdown"), description,
                         params)
