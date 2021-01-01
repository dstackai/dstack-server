from typing import Any

from dstack.content import MediaType
from dstack.handler import EncoderFactory, Encoder, DecoderFactory, Decoder


class TorchModelEncoderFactory(EncoderFactory):
    def accept(self, obj: Any) -> bool:
        return self.has_type(obj, "torch.nn.modules.module.Module")

    def create(self) -> Encoder:
        from dstack.torch.handlers import TorchModelEncoder
        return TorchModelEncoder()


class TorchModelDecoderFactory(DecoderFactory):
    def accept(self, obj: MediaType) -> bool:
        return self.is_media(obj.application, ["torch/state", "torch/model"])

    def create(self) -> Decoder:
        from dstack.torch.handlers import TorchModelDecoder
        return TorchModelDecoder()
