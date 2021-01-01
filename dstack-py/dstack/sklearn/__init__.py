from typing import Any

from dstack.content import MediaType
from dstack.handler import Encoder, Decoder, DecoderFactory, EncoderFactory


class SklearnModelEncoderFactory(EncoderFactory):

    def accept(self, obj: Any) -> bool:
        return self.has_type(obj, "sklearn.base.BaseEstimator")

    def create(self) -> Encoder:
        from dstack.sklearn.handlers import SklearnModelEncoder
        return SklearnModelEncoder()


class SklearnModelDecoderFactory(DecoderFactory):

    def accept(self, obj: MediaType) -> bool:
        return obj.application == "sklearn"

    def create(self) -> Decoder:
        from dstack.sklearn.handlers import SklearnModelDecoder
        return SklearnModelDecoder()
