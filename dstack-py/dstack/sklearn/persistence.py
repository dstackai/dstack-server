import io
import pickle
from abc import ABC, abstractmethod

import cloudpickle
import joblib

from dstack.content import MediaType


class Persistence(ABC):
    @abstractmethod
    def encode(self, model):
        pass

    @abstractmethod
    def decode(self, data):
        pass

    @abstractmethod
    def type(self) -> MediaType:
        pass

    @abstractmethod
    def storage(self) -> str:
        pass


class JoblibPersistence(Persistence):
    def encode(self, model):
        stream = io.BytesIO()
        joblib.dump(model, stream)
        return stream

    def decode(self, stream):
        return joblib.load(stream)

    def type(self) -> MediaType:
        return MediaType("application/octet-stream", "sklearn")

    def storage(self) -> str:
        return "joblib"


class CloudPicklePersistence(Persistence):
    def encode(self, model):
        return cloudpickle.dumps(model)

    def decode(self, stream):
        return cloudpickle.load(stream)

    def type(self) -> MediaType:
        return MediaType("application/octet-stream", "sklearn")

    def storage(self) -> str:
        return "cloudpickle"


class PicklePersistence(Persistence):
    def encode(self, model):
        return pickle.dumps(model)

    def decode(self, data):
        return pickle.loads(data)

    def type(self) -> MediaType:
        return MediaType("application/octet-stream", "sklearn")

    def storage(self) -> str:
        return "pickle"
