from pathlib import Path
from typing import Optional, Dict, Any

from dstack import Encoder, FrameData, StreamContent, MediaType, Decoder
from dstack.content import CONTENT_TYPE_MAP_REVERSED


class FileEncoder(Encoder[Path]):
    def __init__(self, settings: Optional[Dict[str, Any]] = None):
        super().__init__()
        self.settings = settings or {}

    def encode(self, obj: Path, description: Optional[str], params: Optional[Dict]) -> FrameData:
        length = obj.stat().st_size
        media_type = MediaType(CONTENT_TYPE_MAP_REVERSED.get(obj.suffix, "application/octet-stream"))
        f = obj.open("rb")
        buf = StreamContent(f, length)
        settings = {"filename": obj.name}
        settings.update(self.settings)
        return FrameData(buf, media_type, description, params, settings)


class FileDecoder(Decoder[Path]):
    def __init__(self, path: Path):
        super().__init__()
        self.path = path

    def decode(self, data: FrameData) -> Path:
        if not self.path.parent.exists():
            self.path.parent.mkdir(parents=True)

        # FIXME: use stream here
        with self.path.open("wb") as f:
            f.write(data.data.value())

        return self.path
