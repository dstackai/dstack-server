from abc import ABC, abstractmethod
from typing import Optional, Dict

import joblib
import numpy
import scipy
import sklearn
from sklearn.base import BaseEstimator
from sklearn.linear_model import LinearRegression

from dstack.content import BytesContent
from dstack.handler import Encoder, Decoder
from dstack.sklearn.persistence import JoblibPersistence, Persistence, PicklePersistence
from dstack.stack import FrameData


class SklearnModelEncoder(Encoder[BaseEstimator]):
    PERSISTENCE = JoblibPersistence()

    def __init__(self, persistence: Optional[Persistence] = None):
        super().__init__()
        self.map = {
            LinearRegression: LinearRegressionModelInfo
        }
        self.persistence = persistence if persistence else self.PERSISTENCE

    def encode(self, obj: BaseEstimator, description: Optional[str], params: Optional[Dict]) -> FrameData:
        buf = self.persistence.encode(obj)

        settings = {"class": f"{obj.__class__.__module__}.{obj.__class__.__name__}",
                    "scikit-learn": sklearn.__version__,
                    "scipy": scipy.__version__,
                    "numpy": numpy.__version__,
                    "joblib": joblib.__version__,
                    "storage_format": self.persistence.storage()}

        if obj.__class__ in self.map:
            model_info = self.map[obj.__class__](obj)
            settings["info"] = model_info.settings()

        return FrameData(BytesContent(buf), self.persistence.type(), description, params, settings)


class SklearnModelDecoder(Decoder[BaseEstimator]):

    def decode(self, data: FrameData) -> BaseEstimator:
        storage_format = data.settings["storage_format"]
        persist = JoblibPersistence() if storage_format == "joblib" else PicklePersistence()
        return persist.decode(data.data.stream())


class AbstractModelInfo(ABC):
    @abstractmethod
    def settings(self) -> Dict:
        pass


class LinearRegressionModelInfo(AbstractModelInfo):
    def __init__(self, model: LinearRegression):
        self.model = model

    def settings(self) -> Dict:
        return {"dimensions": len(self.model.coef_),
                "fit_intercept": self.model.fit_intercept,
                "normalize": self.model.normalize}
