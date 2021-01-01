import io
from typing import Optional, Dict

import torch
import torch.version
from torch.nn import Module

from dstack import FrameData, BytesContent, Encoder, Decoder
from dstack.content import MediaType


class TorchModelEncoder(Encoder[Module]):
    STORE_WHOLE_MODEL: bool = False
    MAP_LOCATION = None

    def __init__(self, store_whole_model: Optional[bool] = None):
        super().__init__()
        self.store_whole_model = store_whole_model if store_whole_model else self.STORE_WHOLE_MODEL

    def encode(self, obj: Module, description: Optional[str], params: Optional[Dict]) -> FrameData:
        buf = io.BytesIO()

        # FIXME: add model summary here
        settings = {"class": f"{obj.__class__.__module__}.{obj.__class__.__name__}",
                    "torch": torch.version.__version__}

        if self.store_whole_model:
            torch.save(obj, buf)
            application_type = "torch/model"
        else:
            torch.save(obj.state_dict(), buf)
            application_type = "torch/state"

        return FrameData(BytesContent(buf),
                         MediaType("application/octet-stream", application_type),
                         description, params, settings)


class TorchModelDecoder(Decoder[Module]):
    def __init__(self, map_location: Optional[torch.device] = None):
        super().__init__()
        self.map_location = map_location if map_location else TorchModelEncoder.MAP_LOCATION

    def decode(self, data: FrameData) -> Module:
        return torch.load(data.data.stream(), self.map_location)


class TorchModelWeightsDecoder(Decoder[Module]):

    def __init__(self, model: Module, map_location: Optional[torch.device] = None):
        super().__init__()
        self.map_location = map_location if map_location else TorchModelEncoder.MAP_LOCATION
        self.model = model

    def decode(self, data: FrameData) -> Module:
        self.model.load_state_dict(torch.load(data.data.stream(), self.map_location))
        self.model.eval()
        return self.model
