![](https://raw.githubusercontent.com/dstackai/dstack/master/splash.png)

**[dstack](https://dstack.ai/) is an open-source platform to build and share data and ML applications within hours**

[![Discord Chat](https://img.shields.io/discord/687649691688501294.svg)](https://discord.gg/)

## Installation

Installing and running `dstack` is very easy:

```bash
pip install --index-url https://test.pypi.org/simple/ --upgrade --no-cache-dir --extra-index-url=https://pypi.org/simple/ dstack==0.6.1.dev2
dstack server start
```

If you run it for the first time, it may take a while. Once it's done, you'll see the following output:

```bash
To access the application, open this URL in the browser: http://localhost:8080/auth/verify?user=dstack&code=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx&next=/

The default profile in "~/.dstack/config.yaml" is already configured. You are welcome to push your applications using Python package.
```

To access `dstack`, click the URL provided in the output. If you try to access `dstack` without using this URL, it will
require you to sign up using a username and a password.

If you open the URL, you'll see the following interface:

![](https://gblobscdn.gitbook.com/assets%2F-LyOZaAwuBdBTEPqqlZy%2F-MRGHEBnXtyh5_mlTAlZ%2F-MRGIG9IIEM79SdH_Fwx%2Fds_signed_in_empty.png?alt=media&token=90450054-8afa-43ec-b0af-9b3347a45e31)

You'll be logged as the `dstack` user. The page you'll see is `Applications`. It shows you all published applications
which you have access to. The sidebar on the left lets you open other pages: `ML Models`, `Settings`, `Documentation`,
and `Chat`.

## Minimal Application

Here's an elementary example of using `dstack`. The application takes real-time stock exchange data from Yahoo Finance
for the FAANG companies and renders it for a selected symbol. Here's the Python code that you have to run to make such
an application:

```python
from datetime import datetime, timedelta

import dstack.controls as ctrl
import dstack as ds
import plotly.graph_objects as go
import pandas_datareader.data as web


def output_handler(self: ctrl.Output, symbols: ctrl.ComboBox):
    start = datetime.today() - timedelta(days=30)
    end = datetime.today()
    df = web.DataReader(symbols.value(), 'yahoo', start, end)
    fig = go.Figure(
        data=[go.Candlestick(x=df.index, open=df['Open'], high=df['High'], low=df['Low'], close=df['Close'])])
    self.data = fig


app = ds.app(controls=[ctrl.ComboBox(data=["FB", "AMZN", "AAPL", "NFLX", "GOOG"])],
             outputs=[ctrl.Output(handler=output_handler)])

result = ds.push("minimal_app", app)
print(result.url)
```

If you run it and click the provided URL, you'll see the application:

![](https://gblobscdn.gitbook.com/assets%2F-LyOZaAwuBdBTEPqqlZy%2F-MRGHEBnXtyh5_mlTAlZ%2F-MRGIh18UuHTjmCXfIpD%2Fds_minimal_app.png?alt=media&token=17759f21-7e99-43bd-b790-70ecbbf21c3c)

To learn about how this application works and to see other examples, please check out
the [Tutorials](https://docs.dstack.ai/tutorials) documentation page.

To learn in more detail about what applications consist of and how to use all their features, check out
the [Concepts](https://docs.dstack.ai/concepts) documentation page.

## ML Models

`dstack` decouples the development of applications from the development of ML models by offering an `ML registry`. This
way, one can develop ML models, push them to the registry, and then later pull these models from applications.

`dstack`'s `ML Registry` supports `Tensorflow`, `PyTorch`, or `Scikit-Learn` models.

Here's a very simple example of how to push a model to `dstack`:

```python
from sklearn import datasets
from sklearn import svm
import dstack as ds

digits = datasets.load_digits()
clf = svm.SVC(gamma=0.001, C=100.)
clf.fit(digits.data[:-1], digits.target[:-1])

url = ds.push("clf_app", clf)
print(url)
```

Now, if you click the URL, it will open the following page:

![](https://gblobscdn.gitbook.com/assets%2F-LyOZaAwuBdBTEPqqlZy%2F-MRGNY5YFKhVKgIGfGWP%2F-MRGNzac1vfYPdiF6LKJ%2Fds_%20clf_app.png?alt=media&token=6cc4027a-6c4a-489d-bd55-a88f17a7344b)

Here you can see the snippet of how to pull the model from an application or from anywhere else:

```python
import dstack as ds

model = ds.pull('/dstack/clf_app')
```

To learn how to build an application that uses a simple ML model, check out
the [corresponding tutorial](https://docs.dstack.ai/tutorials/simple-application-with-scikit-learn-model).

## Feedback

Do you have any feedback either minor or critical? Please, file [an issue](https://github.com/dstackai/dstack/issues) in
our GitHub repo or write to us on our [Discord Channel](https://discord.com/invite/8xfhEYa).

**Have you tried `dstack`? Please share your feedback with us using this [form](https://forms.gle/4U6Z6hmZhbAtEDK29)!**

## Documentation

For more details on the API and code samples, check out the [docs](https://docs.dstack.ai/).

## Contribution

The instructions on how to build dstack from sources can be found [here](CONTRIBUTING.md).

## License

`dstack` is an open-source library licensed under the Apache 2.0 license