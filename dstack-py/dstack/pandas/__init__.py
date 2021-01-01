from typing import Any

from dstack.content import MediaType
from dstack.handler import Encoder, Decoder, EncoderFactory, DecoderFactory


class DataFrameEncoderFactory(EncoderFactory):

    def accept(self, obj: Any) -> bool:
        return self.is_type(obj, "pandas.core.frame.DataFrame")

    def create(self) -> Encoder:
        from dstack.pandas.handlers import DataFrameEncoder
        return DataFrameEncoder()


class DataFrameDecoderFactory(DecoderFactory):

    def accept(self, obj: MediaType) -> bool:
        return obj.application == "pandas/dataframe"

    def create(self) -> Decoder:
        from dstack.pandas.handlers import DataFrameDecoder
        return DataFrameDecoder()


class SeriesEncoderFactory(EncoderFactory):
    def accept(self, obj: Any) -> bool:
        return self.is_type(obj, "pandas.core.series.Series")

    def create(self) -> Encoder:
        from dstack.pandas.handlers import SeriesEncoder
        return SeriesEncoder()


class SeriesDecoderFactory(DecoderFactory):
    def accept(self, obj: MediaType) -> bool:
        return obj.application == "pandas/series"

    def create(self) -> Decoder:
        from dstack.pandas.handlers import SeriesDecoder
        return SeriesDecoder()


class GeneralCsvDecoderFactory(DecoderFactory):
    def accept(self, obj: MediaType) -> bool:
        return obj.content_type == "text/csv"

    def create(self) -> Decoder:
        from dstack.pandas.handlers import GeneralCsvDecoder
        return GeneralCsvDecoder()
