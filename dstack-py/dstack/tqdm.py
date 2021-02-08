from tqdm import tqdm as std_tqdm
from tqdm.utils import _range
from abc import ABC, abstractmethod
import typing as ty


class TqdmHandler(ABC):
    @abstractmethod
    def display(self, tqdm: std_tqdm):
        pass

    @abstractmethod
    def close(self, tqdm: std_tqdm):
        pass


_tqdm_handler: ty.Optional[TqdmHandler] = None


def set_tqdm_handler(handler: ty.Optional[TqdmHandler]):
    global _tqdm_handler
    _tqdm_handler = handler


class tqdm(std_tqdm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def close(self):
        if _tqdm_handler:
            _tqdm_handler.close(self)

    def display(self, msg=None, pos=None):
        if _tqdm_handler:
            _tqdm_handler.display(self)


def trange(*args, **kwargs):
    return tqdm(_range(*args), **kwargs)
