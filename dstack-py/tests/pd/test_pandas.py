import numpy as np
import pandas as pd

from dstack import push, pull
from dstack.pandas.handlers import DataFrameEncoder, SeriesEncoder
from tests import TestBase


class TestPandas(TestBase):
    def test_with_schema(self):
        df = pd.DataFrame({"float": [1.0],
                           "int": [1],
                           "datetime": [pd.Timestamp("20180310")],
                           "string": ["foo"]})
        push("test/pandas/df_with_schema", df, encoder=DataFrameEncoder(index=False))
        df1 = pull("test/pandas/df_with_schema")
        map(lambda x, y: self.assertEqual(x, y), zip(df.dtypes, df1.dtypes))
        self.assertEqual(df["datetime"][0], df1["datetime"][0])

    def test_nullable_types(self):
        df = pd.DataFrame({"tag1": [10, None], "tag2": [True, None]})
        df1 = df.astype({"tag1": "Int64", "tag2": pd.BooleanDtype()})
        push("test/pandas/nullable_types", df1, encoder=DataFrameEncoder(index=False))
        df2 = pull("test/pandas/nullable_types")
        map(lambda x, y: self.assertEqual(x, y), zip(df2.dtypes, df1.dtypes))

    def test_df_with_index(self):
        raw_data = {"first_name": ["John", "Donald", "Maryam", "Don", "Andrey"],
                    "last_name": ["Milnor", "Knuth", "Mirzakhani", "Zagier", "Okunkov"],
                    "birth_year": [1931, 1938, 1977, 1951, 1969],
                    "school": ["Princeton", "Stanford", "Stanford", "MPIM", "Princeton"]}
        df = pd.DataFrame(raw_data, columns=["first_name", "last_name", "birth_year", "school"])
        push("test/pandas/df_with_index", df)
        df1 = pull("test/pandas/df_with_index")
        self.assertTrue(df.index.to_series().equals(df1.index.to_series()))

    def test_df_with_non_int_index(self):
        dates = pd.date_range('20130101', periods=6)
        df = pd.DataFrame(np.random.randn(6, 4), index=dates, columns=list('ABCD'))
        push("test/pandas/df_with_index_non_int", df)
        df1 = pull("test/pandas/df_with_index_non_int")
        self.assertEqual(df.index.dtype, df1.index.dtype)
        self.assertTrue(df.index.to_series().equals(df1.index.to_series()))

    def test_series(self):
        data = np.array(['a', 'b', 'c', 'd'])
        s = pd.Series(data)
        push("test/pandas/series", s, encoder=SeriesEncoder(index=False))
        s1 = pull("test/pandas/series")
        self.assertTrue(s.equals(s1))

    def test_series_with_index(self):
        data = np.array(['a', 'b', 'c', 'd'])
        s = pd.Series(data, index=[100, 101, 102, 103])
        push("test/pandas/series_with_index", s)
        s1 = pull("test/pandas/series_with_index")
        self.assertEqual(s.index.dtype, s1.index.dtype)
        self.assertTrue(s.equals(s1))

