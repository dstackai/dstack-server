import shutil
import tempfile
from pathlib import Path
from typing import Optional, Dict
from uuid import uuid4

from geopandas import GeoDataFrame, read_file

from dstack.content import MediaType, FileContent, CONTENT_TYPE_MAP_REVERSED
from dstack.handler import Encoder, FrameData, Decoder


class GeoDataFrameEncoder(Encoder[GeoDataFrame]):
    def __init__(self, archive: str = "zip", temp: Optional[Path] = None):
        super().__init__()
        self.archive = archive
        self.temp = temp or Path(tempfile.mkdtemp())

    def encode(self, obj: GeoDataFrame, description: Optional[str], params: Optional[Dict]) -> FrameData:
        filename = self._create_filename()

        if not filename.exists():
            filename.mkdir(parents=True)

        obj.to_file(str(filename / "data.shp"))
        archived = self._create_filename()
        filename = Path(shutil.make_archive(archived, self.archive, str(filename)))
        settings = {"driver": "ESRI Shapefile", "archive": self.archive}
        return FrameData(FileContent(filename), MediaType(self._content_type(filename), "geopandas/geodataframe"),
                         description, params, settings)

    def _create_filename(self) -> Path:
        return self.temp / str(uuid4())

    @staticmethod
    def _content_type(filename) -> str:
        ext = "".join(filename.suffixes)
        return CONTENT_TYPE_MAP_REVERSED.get(ext, "application/octet-stream")


class GeoDataFrameDecoder(Decoder[GeoDataFrame]):
    def __init__(self, temp: Optional[Path] = None):
        super().__init__()
        self.temp = temp or Path(tempfile.mkdtemp())

    def decode(self, data: FrameData) -> GeoDataFrame:
        file = self.save_data(data)
        return read_file(file / "data.shp")

    def save_data(self, data: FrameData) -> Path:
        filename = self._create_filename()

        with filename.open("wb") as f:
            f.write(data.data.stream().read())

        archive = data.settings["archive"]

        unpacked = self._create_filename()
        shutil.unpack_archive(str(filename), extract_dir=str(unpacked), format=archive)
        return unpacked

    def _create_filename(self) -> Path:
        return self.temp / str(uuid4())

