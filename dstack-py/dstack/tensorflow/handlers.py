import shutil
from abc import ABC
from pathlib import Path
from tempfile import gettempdir
from typing import Optional, Dict

import tensorflow as tf
from tensorflow import keras

import dstack.util as util
from dstack import FrameData, Encoder, Decoder
from dstack.content import FileContent, MediaType


class TensorFlowKerasModelEncoder(Encoder[keras.Model]):
    STORE_WHOLE_MODEL: bool = True

    def __init__(self, store_whole_model: Optional[bool] = None, save_format: str = "tf", archive: str = "zip",
                 tmp_dir: Optional[str] = None):
        super().__init__()
        self.store_whole_model = store_whole_model if store_whole_model else self.STORE_WHOLE_MODEL
        self.tmp_dir = Path(tmp_dir if tmp_dir else gettempdir())
        self.save_format = save_format
        self.archive = archive

    def encode(self, obj: keras.Model, description: Optional[str], params: Optional[Dict]) -> FrameData:
        filename = util.create_filename(self.tmp_dir)

        if self.store_whole_model:
            obj.save(filename, save_format=self.save_format)
            application_type = "tensorflow/model"
        else:
            obj.save_wights(filename, save_format=self.save_format)
            application_type = "tensorflow/weights"

        settings = {
            "class": f"{obj.__class__.__module__}.{obj.__class__.__name__}",
            "tensorflow": tf.__version__,
            "storage_format": self.archive
        }

        if self.save_format == "tf":
            archived = util.create_filename(self.tmp_dir)
            filename = shutil.make_archive(archived, self.archive, filename)

        return FrameData(FileContent(Path(filename)),
                         MediaType("application/octet-stream", application_type),
                         description, params, settings)


class TensorFlowKerasAbstractDecoder(Decoder[keras.Model], ABC):
    def __init__(self, tmp_dir: Optional[str] = None):
        super().__init__()
        self.tmp_dir = Path(tmp_dir if tmp_dir else gettempdir())

    def save_data(self, data: FrameData) -> str:
        filename = util.create_filename(self.tmp_dir)

        with data.data.stream() as stream:
            with open(filename, "wb") as f:
                f.write(stream.read())

        storage_format = data.settings["storage_format"]

        if storage_format != "h5":
            unpacked = util.create_filename(self.tmp_dir)
            shutil.unpack_archive(filename, extract_dir=unpacked, format=storage_format)
            filename = unpacked

        return filename


class TensorFlowKerasModelDecoder(TensorFlowKerasAbstractDecoder):

    def __init__(self, tmp_dir: Optional[str] = None):
        super().__init__(tmp_dir)

    def decode(self, data: FrameData) -> keras.Model:
        return keras.models.load_model(self.save_data(data))


class TensorflowKerasModelWeightsDecoder(TensorFlowKerasAbstractDecoder):

    def __init__(self, model: keras.Model, tmp_dir: Optional[str] = None):
        super().__init__(tmp_dir)
        self.model = model

    def decode(self, data: FrameData) -> keras.Model:
        return self.model.load_weights(self.save_data(data))
