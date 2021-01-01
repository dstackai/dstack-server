import inspect
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, TypeVar, Generic, List

from dstack.content import Content, MediaType
from dstack.context import ContextAwareObject


class DecoratedValue(ABC):
    @abstractmethod
    def decorate(self) -> Dict[str, Any]:
        pass


class FrameData:
    """Represent frame data structure which will be attached to stack frame by `commit` and can be sent by protocol
    implementation, as JSON for example. Every frame can contain many `FrameData` objects, any such object represent
    a piece of data user is going to publish, e.g. a chart with specified parameters.
    Every frame must have at least one `FrameData` object attached.
    Any handler must produce `FrameData` from raw data, like Matplotlib `Figure` or any other chart object.
    """

    def __init__(self, data: Content,
                 media_type: MediaType,
                 description: Optional[str],
                 params: Optional[Dict],
                 settings: Optional[Dict] = None):
        """Create frame data.
        Args:
            data: A binary representation of the object to be displayed.
            media_type: Supported media type.
            description: Optional description.
            params: A dictionary with parameters which will be used to produce appropriate controls.
            settings: Optional settings are usually used to store libraries versions or extra information
                required to display data correctly.
        """
        self.data = data
        self.content_type = media_type.content_type
        self.application = media_type.application
        self.description = description
        self.settings = settings

        if params:
            for k, v in params.items():
                if isinstance(v, DecoratedValue):
                    params[k] = v.decorate()

        self.params = params

    def media_type(self) -> MediaType:
        return MediaType(self.content_type, self.application)


T = TypeVar("T")
S = TypeVar("S")


class Encoder(ContextAwareObject, Generic[T]):

    @abstractmethod
    def encode(self, obj: T, description: Optional[str], params: Optional[Dict]) -> FrameData:
        """Convert data object to appropriate format.
        Args:
            obj: A data which is needed to be converted, e.g. plot.
            description: Description of the data.
            params: Parameters of the data, which are needed to be displayed,
                e.g. plot or model settings.

        Returns:
            Frame data.
        """
        pass


class Decoder(ContextAwareObject, Generic[T]):

    @abstractmethod
    def decode(self, data: FrameData) -> T:
        pass


class AbstractFactory(Generic[T, S], ABC):
    @abstractmethod
    def accept(self, obj: T) -> bool:
        pass

    @abstractmethod
    def create(self) -> S:
        pass


class EncoderFactory(AbstractFactory[Any, Encoder], ABC):
    @staticmethod
    def has_type(obj: Any, tpe: str) -> bool:
        return f"<class '{tpe}'>" in map(lambda x: str(x), inspect.getmro(obj.__class__))

    @staticmethod
    def is_type(obj: Any, tpe: str) -> bool:
        return str(type(obj)) == f"<class '{tpe}'>"


class DecoderFactory(AbstractFactory[MediaType, Decoder], ABC):
    @staticmethod
    def is_media(obj: str, media: List[str]):
        return isinstance(obj, str) and str(obj) in media
