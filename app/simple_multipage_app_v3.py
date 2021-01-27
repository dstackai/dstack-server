import dstack.controls as ctrl
import dstack as ds
import pandas as pd
import plotly.express as px


@ds.cache()
def get_data():
    return pd.read_csv("https://www.dropbox.com/s/cat8vm6lchlu5tp/data.csv?dl=1", index_col=0)


@ds.cache()
def get_regions():
    df = get_data()
    return df["Region"].unique().tolist()


def get_countries_by_region(self: ctrl.ComboBox, regions: ctrl.ComboBox):
    df = get_data()
    self.data = df[df["Region"] == regions.value()]["Country"].unique().tolist()


def get_companies_by_country(self: ctrl.ComboBox, countries: ctrl.ComboBox):
    df = get_data()
    self.data = df[df["Country"] == countries.value()]["Company"].unique().tolist()


regions = ctrl.ComboBox(data=get_regions, label="Region")
countries = ctrl.ComboBox(handler=get_countries_by_region, label="Country", depends=[regions])
companies = ctrl.ComboBox(handler=get_companies_by_country, label="Company", depends=[countries], require_apply=True)


@ds.cache()
def get_data_by_country(self: ctrl.Output, countries: ctrl.ComboBox):
    df = get_data()
    self.data = df[df["Country"] == countries.value()]


@ds.cache()
def get_data_by_company(self: ctrl.Control, companies: ctrl.ComboBox):
    df = get_data()
    row = df[df["Company"] == companies.value()].filter(["y2015", "y2016", "y2017", "y2018", "y2019"], axis=1)
    row.rename(columns={"y2015": "2015", "y2016": "2016", "y2017": "2017", "y2018": "2018", "y2019": "2019"},
               inplace=True)
    col = row.transpose()
    col.rename(columns={col.columns[0]: "Licenses"}, inplace=True)
    fig = px.bar(col.reset_index(), x="index", y="Licenses", labels={"index": "Year"})
    fig.update(layout_showlegend=False)
    self.data = fig


def output_handler(self: ctrl.Output, a, b, c):
    self.data = ds.md("Hello, this is Markdown.")


md_output = ctrl.Output(handler=output_handler, depends=[])

country_output = ctrl.Output(label="Country data", handler=get_data_by_country, depends=[countries])

company_output = ctrl.Output(label="Company data", handler=get_data_by_company, depends=[companies])

app = ds.app(controls=[regions, countries, companies], outputs=[md_output, country_output, company_output])

url = ds.push("simple_multipage_app_v3", app)
print(url)