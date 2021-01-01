from abc import ABC, abstractmethod
from csv import QUOTE_ALL
from io import StringIO
from typing import Optional, Dict, TypeVar, List

from pandas import __version__ as pandas_version, DataFrame, read_csv, Series
from pandas.core.generic import NDFrame

from dstack.content import BytesContent, MediaType
from dstack.handler import Encoder, Decoder
from dstack.stack import FrameData


class AbstractDataFrameEncoder(Encoder[NDFrame], ABC):
    def __init__(self, encoding: str = "utf-8", header: bool = True,
                 index: bool = True):
        super().__init__()
        self.encoding = encoding
        self.header = header
        self.index = index

    def encode(self, obj: NDFrame, description: Optional[str], params: Optional[Dict]) -> FrameData:
        buf = StringIO()
        obj.to_csv(buf, index=self.index, header=self.header, encoding=self.encoding, quoting=QUOTE_ALL)
        index_type = [str(obj.index.dtype)] if self.index else []

        return FrameData(BytesContent(buf.getvalue().encode(self.encoding)), MediaType("text/csv", self.application()),
                         description, params,
                         {"header": self.header,
                          "index": self.index,
                          "schema": index_type + self.schema(obj),
                          "encoding": self.encoding,
                          "version": pandas_version})

    @abstractmethod
    def application(self) -> str:
        pass

    @abstractmethod
    def schema(self, obj: NDFrame) -> List[str]:
        pass


class DataFrameEncoder(AbstractDataFrameEncoder):
    def application(self) -> str:
        return "pandas/dataframe"

    def schema(self, obj: NDFrame) -> List[str]:
        return [str(t) for t in obj.dtypes]


class SeriesEncoder(AbstractDataFrameEncoder):
    def application(self) -> str:
        return "pandas/series"

    def schema(self, obj: NDFrame) -> List[str]:
        return [str(obj.dtypes)]


T = TypeVar("T", DataFrame, Series)


class AbstractDataFrameDecoder(Decoder[T], ABC):
    def decode(self, data: FrameData) -> T:
        index_col = 0 if data.settings.get("index", None) else None

        df = read_csv(data.data.stream(),
                      encoding=data.settings.get("encoding", "utf-8"),
                      index_col=index_col,
                      squeeze=self.is_series())

        return self.post_process(df, data.settings)

    @abstractmethod
    def is_series(self) -> bool:
        pass

    @abstractmethod
    def post_process(self, df: T, settings: Dict) -> T:
        pass


class DataFrameDecoder(AbstractDataFrameDecoder[DataFrame]):
    def is_series(self) -> bool:
        return False

    def post_process(self, df: DataFrame, settings: Dict) -> DataFrame:
        has_index = settings["index"]
        schema = settings["schema"]

        if has_index:
            df.index = df.index.astype(schema[0])
            schema = schema[1:]

        cols = [str(col) for col in df.columns]

        return df.astype(dict(zip(cols, schema)))


class SeriesDecoder(AbstractDataFrameDecoder[Series]):
    def is_series(self) -> bool:
        return True

    def post_process(self, s: Series, settings: Dict) -> Series:
        has_index = settings["index"]
        schema = settings["schema"]

        if has_index:
            s.index = s.index.astype(schema[0])
            schema = schema[1:]

        return s.astype(schema[0])


class GeneralCsvDecoder(AbstractDataFrameDecoder[DataFrame]):
    def is_series(self) -> bool:
        return False

    def post_process(self, df: DataFrame, settings: Dict) -> DataFrame:
        return df
