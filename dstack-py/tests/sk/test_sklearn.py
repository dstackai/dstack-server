from sklearn.datasets import make_regression
from sklearn.linear_model import LinearRegression

from dstack import push, pull
from tests import TestBase


class TestSklearn(TestBase):
    def test_push_pull_linear_model(self):
        # generate regression dataset
        x, y = make_regression(n_samples=20, n_features=1, noise=0.75)

        # create the training and test datasets
        from sklearn.model_selection import train_test_split
        x_train, x_test, y_train, y_test = \
            train_test_split(x, y, test_size=0.3, random_state=1234)

        # train the simple Linear regression
        std_reg = LinearRegression()
        std_reg.fit(x_train, y_train)

        push("test/sklearn/my_linear_model", std_reg, "My first linear model")
        my_model: LinearRegression = pull("test/sklearn/my_linear_model")

        self.assertEqual(std_reg.coef_, my_model.coef_)
        self.assertEqual(std_reg.intercept_, my_model.intercept_)
        self.assertEqual(std_reg.normalize, my_model.normalize)
