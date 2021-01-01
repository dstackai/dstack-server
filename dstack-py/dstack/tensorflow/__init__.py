from typing import Any

from dstack.content import MediaType
from dstack.handler import Encoder, Decoder, EncoderFactory, DecoderFactory


class TensorFlowKerasModelEncoderFactory(EncoderFactory):
    def accept(self, obj: Any) -> bool:
        return self.has_type(obj, "tensorflow.python.keras.engine.training.Model")

    def create(self) -> Encoder:
        from dstack.tensorflow.handlers import TensorFlowKerasModelEncoder
        return TensorFlowKerasModelEncoder()


class TensorFlowKerasModelDecoderFactory(DecoderFactory):
    def accept(self, obj: MediaType) -> bool:
        return self.is_media(obj.application, ["tensorflow/model"])

    def create(self) -> Decoder:
        from dstack.tensorflow.handlers import TensorFlowKerasModelDecoder
        return TensorFlowKerasModelDecoder()
