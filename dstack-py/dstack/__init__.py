import base64
import json
import os
import typing as ty
from functools import wraps
from deprecation import deprecated

from dstack.auto import AutoHandler
from dstack.config import Config, ConfigFactory, YamlConfigFactory, \
    from_yaml_file, ConfigurationError, get_config, Profile, _get_config_path
from dstack.content import StreamContent, BytesContent, MediaType, FileContent
from dstack.context import Context
from dstack.handler import Encoder, Decoder, T, DecoratedValue
from dstack.protocol import Protocol, JsonProtocol, MatchError, create_protocol
from dstack.stack import EncryptionMethod, NoEncryption, StackFrame, merge_or_none, FrameData, PushResult, FrameMeta
from dstack.application import Application


def push(stack: str, obj, description: ty.Optional[str] = None,
         access: ty.Optional[str] = None,
         meta: ty.Optional[FrameMeta] = None,
         params: ty.Optional[ty.Dict] = None,
         encoder: ty.Optional[Encoder[ty.Any]] = None,
         profile: str = "default",
         **kwargs) -> PushResult:
    """Create a frame in the stack, commits and pushes data in a single operation.

    Args:
        stack: A stack you want to commit and push to.
        obj: Object to commit and push, e.g. plot.
        description: Optional description of the object.
        access: Access level for the stack. It may be public, private or None. It is None by default, so it will be
                default access level in user's settings.
        meta: Push message to associate some parameters with this revision, e.g. text message.
        params: Optional parameters.
        encoder: Specify a handler to handle the object, by default `AutoHandler` will be used.
        profile: Profile you want to use, i.e. username and token. Default profile is 'default'.
        **kwargs: Revision parameters.
    Raises:
        ServerException: If server returns something except HTTP 200, e.g. in the case of authorization failure.
        ConfigurationException: If something goes wrong with configuration process, config file does not exist an so on.
    """

    f = frame(stack=stack,
              profile=profile,
              access=access,
              check_access=False)
    f.add(obj, description, params, encoder, **kwargs)
    return f.push(meta)


@deprecated(details="Use push instead")
def push_frame(stack: str, obj, description: ty.Optional[str] = None,
               access: ty.Optional[str] = None,
               message: ty.Optional[str] = None,
               params: ty.Optional[ty.Dict] = None,
               encoder: ty.Optional[Encoder[ty.Any]] = None,
               profile: str = "default",
               **kwargs) -> PushResult:
    """Create a frame in the stack, commits and pushes data in a single operation.

    Args:
        stack: A stack you want to commit and push to.
        obj: Object to commit and push, e.g. plot.
        description: ty.Optional description of the object.
        access: Access level for the stack. It may be public, private or None. It is None by default, so it will be
                default access level in user's settings.
        message: Push message to describe what's new in this revision.
        params: ty.Optional parameters.
        encoder: Specify a handler to handle the object, by default `AutoHandler` will be used.
        profile: Profile you want to use, i.e. username and token. Default profile is 'default'.
        **kwargs: ty.Optional parameters is an alternative to params. If both are present this one
            will be merged into params.
    Raises:
        ServerException: If server returns something except HTTP 200, e.g. in the case of authorization failure.
        ConfigurationException: If something goes wrong with configuration process, config file does not exist an so on.
    """
    return push(stack, obj, description, access, FrameMeta(message=message), params, encoder, profile, **kwargs)


def frame(stack: str,
          profile: str = "default",
          access: ty.Optional[str] = None,
          auto_push: bool = False,
          check_access: bool = True) -> StackFrame:
    """Create a new stack frame. The method also checks access to specified stack.

    Args:
        stack: A stack you want to use. It must be a full path to the stack e.g. `project/sub-project/plot`.
        profile: A profile refers to credentials, i.e. username and token. Default profile is 'default'.
            The system is looking for specified profile as follows:
            it looks into working directory to find a configuration file (local configuration),
            if the file doesn't exist it looks into user directory to find it (global configuration).
            There are CLI tools to manage profiles. You can use this command in console:

                $ dstack config --list

            to list existing profiles or add or replace token by following command:

                $ dstack config --profile <PROFILE>

            or simply

                $ dstack config

            if <PROFILE> is not specified 'default' profile will be created. The system asks you about token
            from command line, make sure that you have already obtained token from the site.
        access: Specify access level for this stack. It may be one of the following:
            private - This means the stack will be visible only for the author.
            public  - The stack will be accessible for everyone.
            None    - Default access level will be used, one can find it in own settings on dstack server.
            If it is not specified default access level will be used.
        auto_push:  Tells the system to push frame just after the commit. It may be useful if you
            want to see result immediately. Default is False.
        check_access: Check access to be sure about credentials before trying to actually push something.
            Default is `True`.

    Returns:
        A new stack frame.

    Raises:
        ServerException: If server returns something except HTTP 200, e.g. in the case of authorization failure.
        ConfigurationException: If something goes wrong with configuration process, config file does not exist an so on.
    """
    if access and access not in ["private", "public"]:
        raise ValueError(f"access can be only private, public or None but found {access}")

    context = create_context(stack, profile)

    return _create_frame(context, access=access, auto_push=auto_push, check_access=check_access)


@deprecated(details="Use frame instead")
def create_frame(stack: str,
                 profile: str = "default",
                 access: ty.Optional[str] = None,
                 auto_push: bool = False,
                 check_access: bool = True) -> StackFrame:
    """Create a new stack frame. The method also checks access to specified stack.

    Args:
        stack: A stack you want to use. It must be a full path to the stack e.g. `project/sub-project/plot`.
        profile: A profile refers to credentials, i.e. username and token. Default profile is 'default'.
            The system is looking for specified profile as follows:
            it looks into working directory to find a configuration file (local configuration),
            if the file doesn't exist it looks into user directory to find it (global configuration).
            There are CLI tools to manage profiles. You can use this command in console:

                $ dstack config --list

            to list existing profiles or add or replace token by following command:

                $ dstack config --profile <PROFILE>

            or simply

                $ dstack config

            if <PROFILE> is not specified 'default' profile will be created. The system asks you about token
            from command line, make sure that you have already obtained token from the site.
        access: Specify access level for this stack. It may be one of the following:
            private - This means the stack will be visible only for the author.
            public  - The stack will be accessible for everyone.
            None    - Default access level will be used, one can find it in own settings on dstack server.
            If it is not specified default access level will be used.
        auto_push:  Tells the system to push frame just after the commit. It may be useful if you
            want to see result immediately. Default is False.
        check_access: Check access to be sure about credentials before trying to actually push something.
            Default is `True`.

    Returns:
        A new stack frame.

    Raises:
        ServerException: If server returns something except HTTP 200, e.g. in the case of authorization failure.
        ConfigurationException: If something goes wrong with configuration process, config file does not exist an so on.
    """
    return frame(stack, profile, access, auto_push, check_access)


def _create_frame(context: Context, access: ty.Optional[str] = None, auto_push: bool = False,
                  check_access: bool = True) -> StackFrame:
    frame = StackFrame(context,
                       access=access,
                       auto_push=auto_push,
                       encryption=get_encryption(context.profile))
    if check_access:
        frame.send_access()

    return frame


# def _push(context: Context, obj: ty.Any,
#           description: ty.Optional[str] = None,
#           access: ty.Optional[str] = None,
#           message: ty.Optional[str] = None,
#           params: ty.Optional[ty.Dict] = None,
#           encoder: ty.Optional[Encoder[ty.Any]] = None,
#           **kwargs) -> PushResult:
#     frame = _create_frame(context,
#                           access=access,
#                           check_access=False)
#     frame.commit(obj, description, params, encoder, **kwargs)
#     return frame.push(message)


def get_encryption(profile: Profile) -> EncryptionMethod:
    return NoEncryption()


# TODO: Write tests that ensures that cache works
def pull_data(context: Context, params: ty.Optional[ty.Dict] = None, **kwargs) -> FrameData:
    path = context.stack_path()
    params = merge_or_none(params, kwargs)

    # TODO: Split context.protocol.pull into to pull_head and pull_frame
    frame, index, res = context.protocol.pull(path, context.profile.token, params)
    attach = res["attachment"]

    data = _cache_attach_data(attach, context, frame, index, path)

    media_type = MediaType(attach["content_type"], attach.get("application", None))
    return FrameData(data, media_type, attach.get("description", None),
                     attach.get("params", None), attach.get("settings", None))


def _cache_attach_data(attach, context, frame, index, path):
    cache_dir = _get_config_path().parent / "cache"
    file = cache_dir / "files" / os.sep.join(path.split("/")) / frame / str(index)
    attach_file = cache_dir / "attachs" / os.sep.join(path.split("/")) / frame / (str(index) + ".json")
    if not file.exists() or not attach_file.exists() or file.stat().st_size != attach.get("length"):
        data = BytesContent(base64.b64decode(attach["data"])) if "data" in attach else \
            StreamContent(*context.protocol.download(attach["download_url"]))

        if file.exists():
            os.remove(file)
        if attach_file.exists():
            os.remove(attach_file)

        file.parent.mkdir(parents=True, exist_ok=True)
        data.to_file(file, show_progress=False)

        attach_file.parent.mkdir(parents=True, exist_ok=True)
        with open(attach_file, 'a') as a:
            a.write(json.dumps(attach))

    data = FileContent(file)
    return data


# TODO: Support frame and attach_index
def pull(stack: str,
         profile: str = "default",
         params: ty.Optional[ty.Dict] = None,
         decoder: ty.Optional[Decoder[ty.Any]] = None,
         **kwargs) -> ty.Any:
    return _pull(create_context(stack, profile), params, decoder, **kwargs)


def _pull(context: Context,
          params: ty.Optional[ty.Dict] = None,
          decoder: ty.Optional[Decoder[ty.Any]] = None,
          **kwargs) -> ty.Any:
    decoder = decoder or AutoHandler()
    decoder.set_context(context)
    return decoder.decode(pull_data(context, params, **kwargs))


def create_context(stack: str, profile: str = "default") -> Context:
    profile = get_config().get_profile(profile)
    protocol = create_protocol(profile)
    return Context(stack, profile, protocol)


def tab(title: ty.Optional[str] = None) -> DecoratedValue:
    class Tab(DecoratedValue):
        def __init__(self, title: ty.Optional[str] = None):
            self.title = title

        def decorate(self) -> ty.Dict[str, ty.Any]:
            decorated = {"type": "tab"}

            if self.title:
                decorated["title"] = self.title

            return decorated

    return Tab(title)


def app(handler: ty.Callable, depends: ty.Optional[ty.Union[str, ty.List[str]]] = None,
        requirements: ty.Optional[str] = None, project: bool = False, **kwargs):
    return Application(handler, depends, requirements, project, **kwargs)


def default_hash_func(*args, **kwargs):
    if len(kwargs) > 0 or len(args) > 0:
        return args, frozenset(kwargs.items())
    else:
        return 0


def _hash(obj):
    return hash(obj)


def cache(hash_func=default_hash_func):
    memo = {}

    def decorator(func):
        func.__hash_func__ = hash_func

        @wraps(func)
        def wrapper(*args, **kwargs):
            hash_value = _hash(hash_func(*args, **kwargs))

            try:
                return memo[(func, hash_value)]
            except KeyError:
                rv = func(*args, **kwargs)
                memo[(func, hash_value)] = rv
                return rv

        wrapper.__decorated__ = func

        return wrapper

    return decorator
