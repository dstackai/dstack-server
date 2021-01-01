import geopandas
import pandas as pd

from dstack import push, pull
from tests import TestBase


class TestGeoPandas(TestBase):
    def test_geo_df(self):
        df = pd.DataFrame(
            {'City': ['Buenos Aires', 'Brasilia', 'Santiago', 'Bogota', 'Caracas'],
             'Country': ['Argentina', 'Brazil', 'Chile', 'Colombia', 'Venezuela'],
             'Latitude': [-34.58, -15.78, -33.45, 4.60, 10.48],
             'Longitude': [-58.66, -47.91, -70.66, -74.08, -66.86]})

        gdf = geopandas.GeoDataFrame(
            df, geometry=geopandas.points_from_xy(df.Longitude, df.Latitude))

        push("my_first_geo", gdf)
        self.assertEqual("application/zip", self.get_data("my_first_geo")["attachments"][0]["content_type"])

        gdf1 = pull("my_first_geo")
        self.assertTrue(gdf.equals(gdf1))

