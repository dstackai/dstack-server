import re
from abc import ABC

from dstack.config import Profile
from dstack.protocol import Protocol


class Context(object):
    def __init__(self, stack: str, profile: Profile, protocol: Protocol):
        self.stack = stack
        self.profile = profile
        self.protocol = protocol

    def derive(self, new_stack: str) -> 'Context':
        return Context(new_stack, self.profile, self.protocol)

    def stack_path(self) -> str:
        if re.match("^[a-zA-Z0-9-_/]{3,255}$", self.stack):
            return self.stack[1:] if self.stack[0] == "/" else f"{self.profile.user}/{self.stack}"
        else:
            raise ValueError("Stack name can contain only latin letters, digits, slash and underscore")

    def __eq__(self, other) -> bool:
        return isinstance(other, Context) and self.stack_path() == other.stack_path()

    def __repr__(self):
        return self.stack_path()


class ContextAwareObject(ABC):
    def __init__(self):
        self._context = None

    def set_context(self, context: Context):
        self._context = context

    def get_context(self) -> Context:
        assert self._context is not None
        return self._context

