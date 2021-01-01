from typing import Any

from dstack.content import MediaType
from dstack.handler import EncoderFactory, Encoder, DecoderFactory, Decoder


class GeoDataFrameEncoderFactory(EncoderFactory):

    def accept(self, obj: Any) -> bool:
        return self.is_type(obj, "geopandas.geodataframe.GeoDataFrame")

    def create(self) -> Encoder:
        from dstack.geopandas.handlers import GeoDataFrameEncoder
        return GeoDataFrameEncoder()


class GeoDataFrameDecoderFactory(DecoderFactory):

    def accept(self, obj: MediaType) -> bool:
        return obj.application == "geopandas/geodataframe"

    def create(self) -> Decoder:
        from dstack.geopandas.handlers import GeoDataFrameDecoder
        return GeoDataFrameDecoder()
