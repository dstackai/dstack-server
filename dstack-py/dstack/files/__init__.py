from pathlib import Path
from typing import Any

from dstack.handler import EncoderFactory, Encoder


class FileEncoderFactory(EncoderFactory):
    def accept(self, obj: Any) -> bool:
        return isinstance(obj, Path) and not obj.is_dir()

    def create(self) -> Encoder:
        from dstack.files.handlers import FileEncoder
        return FileEncoder()
