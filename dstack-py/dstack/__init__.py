import base64
import json
import os
import typing as ty
from functools import wraps

from deprecation import deprecated

from dstack import md
from dstack.auto import AutoHandler
from dstack.config import Config, ConfigFactory, YamlConfigFactory, \
    from_yaml_file, ConfigurationError, get_config, Profile, _get_config_path
from dstack.content import StreamContent, BytesContent, MediaType, FileContent
from dstack.context import Context
from dstack.controls import Control, Select, Input, Output, Markdown, Slider, Uploader, Upload, Checkbox
from dstack.handler import Encoder, Decoder, T, DecoratedValue
from dstack.protocol import Protocol, JsonProtocol, MatchError, create_protocol
from dstack.stack import EncryptionMethod, NoEncryption, StackFrame, merge_or_none, FrameData, PushResult, FrameMeta

import inspect
from pathlib import Path
from types import ModuleType
from dstack.tqdm import tqdm, trange

from dstack.application.dependencies import Dependency, RequirementsDependency, ProjectDependency, ModuleDependency, \
    PackageDependency

from dstack.version import __version__

__all__ = ['__version__', 'Control', 'Output', 'Input', 'Select', 'Slider', 'Markdown', 'Uploader', 'Checkbox', 'Upload', 'tqdm',
           'trange']


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
def pull_data(context: Context, params: ty.Optional[ty.Dict] = None,
              meta: ty.Optional[ty.Dict] = None, **kwargs) -> FrameData:
    path = context.stack_path()
    params = merge_or_none(params, kwargs)

    # TODO: Split context.protocol.pull into to pull_head and pull_frame
    frame, index, res = context.protocol.pull(path, context.profile.token, params, meta)
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


# TODO: Make it protected. Move config to pull
def create_context(stack: str, profile: str = "default", config: ty.Optional[Config] = None) -> Context:
    profile = (config or get_config()).get_profile(profile)
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


def markdown(text: str):
    return md.Markdown(text)


def app(description: ty.Optional[str] = None,
        controls: ty.Optional[ty.List[Control]] = None,
        depends: ty.Optional[ty.Union[str, ty.List[str]]] = None,
        requirements: ty.Optional[str] = None,
        project: bool = False,
        layout: ty.Optional[str] = "grid",
        columns: ty.Optional[int] = 12):
    return Application(description, controls, depends, requirements, project, None, layout, columns)


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


T = ty.TypeVar('T')


class ApplicationContainer:
    def __init__(self, id: ty.Optional[str],
                 layout: ty.Optional[str],
                 columns: ty.Optional[int],
                 controls: ty.Optional[ty.List[Control]]):
        self.id = id
        self.layout = layout
        self.columns = columns
        self.controls = controls or []

    def select(self,
               items: ty.Union[ty.Optional[T], ty.Callable[[], T]] = None,
               handler: ty.Optional[ty.Callable[..., None]] = None,
               selected: ty.Optional[ty.Union[int, list]] = None,
               multiple: bool = False,
               placeholder: ty.Optional[str] = None,
               label: ty.Optional[str] = None,
               depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None,
               title: ty.Optional[ty.Callable[[T], str]] = None,
               visible: bool = True,
               colspan: ty.Optional[int] = None,
               rowspan: ty.Optional[int] = None) -> Select:
        select = Select(items, handler, None, selected, multiple, placeholder, label, depends, title, self.id, visible,
                        self.validate_colspan(colspan, minimum=2, default=2),
                        self.validate_rowspan(rowspan, minimum=1, default=1))
        self.controls.append(select)
        return select

    def validate_colspan(self, colspan, minimum, default):
        return min(max((colspan or default), minimum), self.columns)

    def validate_rowspan(self, rowspan, minimum, default, maximum=None):
        _m = max((rowspan or default), minimum)
        return min(_m, maximum) if maximum is not None else _m

    def input(self,
              text: ty.Union[ty.Optional[str], ty.Callable[[], str]] = None,
              handler: ty.Optional[ty.Callable[..., None]] = None,
              placeholder: ty.Optional[str] = None,
              label: ty.Optional[str] = None,
              depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None,
              require_apply: bool = False,
              optional: ty.Optional[bool] = None,
              visible: bool = True,
              colspan: ty.Optional[int] = None,
              rowspan: ty.Optional[int] = None) -> Input:
        input = Input(text, handler, placeholder, label, depends, require_apply, optional, self.id, visible,
                     self.validate_colspan(colspan, minimum=2, default=2),
                     self.validate_rowspan(rowspan, minimum=1, default=1))
        self.controls.append(input)
        return input

    def output(self,
               data: ty.Union[ty.Optional[ty.Any], ty.Callable[[], ty.Any]] = None,
               handler: ty.Optional[ty.Callable[..., None]] = None,
               label: ty.Optional[str] = None,
               depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None,
               visible: bool = True,
               colspan: ty.Optional[int] = None,
               rowspan: ty.Optional[int] = None,
               require_apply: bool = False) -> Output:
        output = Output(data, handler, label, depends, self.id, visible,
                        self.validate_colspan(colspan, 6, default=6),
                        self.validate_rowspan(rowspan, minimum=6, default=6), require_apply)
        self.controls.append(output)
        return output

    def markdown(self, text: ty.Union[ty.Optional[str], ty.Callable[[], str]] = None,
                 handler: ty.Optional[ty.Callable[..., None]] = None,
                 label: ty.Optional[str] = None,
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None,
                 visible: bool = True,
                 colspan: ty.Optional[int] = None,
                 rowspan: ty.Optional[int] = None,
                 require_apply: bool = False) -> Markdown:
        markdown = Markdown(text, handler, label, depends, self.id, visible,
                            self.validate_colspan(colspan, minimum=6, default=self.columns),
                            self.validate_rowspan(rowspan, minimum=1, default=1), require_apply)
        self.controls.append(markdown)
        return markdown

    def slider(self,
               values: ty.Optional[ty.Union[ty.Iterable[float], ty.Callable]] = None,
               handler: ty.Optional[ty.Callable[..., None]] = None,
               selected: int = 0,
               label: ty.Optional[str] = None,
               depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None,
               visible: bool = True,
               colspan: ty.Optional[int] = None,
               rowspan: ty.Optional[int] = None,
               require_apply: bool = False) -> Slider:
        slider = Slider(values, handler, selected, label, depends, self.id, visible,
                        self.validate_colspan(colspan, minimum=2, default=2),
                        self.validate_rowspan(rowspan, minimum=1, default=1, maximum=1), require_apply)
        self.controls.append(slider)
        return slider

    def uploader(self,
                 uploads: ty.Union[ty.Optional[ty.List[Upload]], ty.Callable[[], ty.List[Upload]]] = None,
                 multiple: bool = False,
                 label: ty.Optional[str] = None,
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None,
                 handler: ty.Optional[ty.Callable[..., None]] = None,
                 optional: ty.Optional = None,
                 visible: bool = True,
                 colspan: ty.Optional[int] = None,
                 rowspan: ty.Optional[int] = None) -> Uploader:
        uploader = Uploader(uploads, multiple, label, depends, handler, optional, self.id, visible,
                            self.validate_colspan(colspan, minimum=2, default=2),
                            self.validate_rowspan(rowspan, minimum=1, default=1))
        self.controls.append(uploader)
        return uploader

    def checkbox(self,
                 selected: ty.Union[bool, ty.Callable[[], bool]] = False,
                 handler: ty.Optional[ty.Callable[..., None]] = None,
                 label: ty.Optional[str] = None,
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None,
                 visible: bool = True,
                 colspan: ty.Optional[int] = None,
                 rowspan: ty.Optional[int] = None) -> Checkbox:
        checkbox = Checkbox(selected, handler, label, depends, self.id, visible,
                            self.validate_colspan(colspan, minimum=2 if label else 1, default=2 if label else 1),
                            self.validate_rowspan(rowspan, minimum=1, default=1, maximum=1))
        self.controls.append(checkbox)
        return checkbox


class Sidebar(ApplicationContainer):
    def __init__(self, controls: ty.Optional[ty.List[Control]]):
        super().__init__(id="sidebar", layout="grid", columns=2, controls=controls)


class ApplicationBase(ApplicationContainer):
    def __init__(self,
                 id: ty.Optional[str],
                 description: ty.Optional[str],
                 controls: ty.Optional[ty.List[Control]],
                 depends: ty.Optional[ty.Union[str, ModuleType, ty.List[ty.Union[str, ModuleType]]]],
                 requirements: ty.Optional[str],
                 project: bool,
                 sidebar: ty.Optional[Sidebar],
                 layout: ty.Optional[str],
                 columns: ty.Optional[int]):
        super().__init__(id, layout, columns, controls)
        self.description = description
        self.depends = depends
        self.requirements = requirements
        self.project = project
        self._sidebar = sidebar

    def sidebar(self) -> Sidebar:
        if self._sidebar:
            return self._sidebar
        else:
            sidebar = Sidebar(controls=[])
            self._sidebar = sidebar
            return sidebar

    # TODO: Move it to Controller and make private
    def deps(self) -> ty.List[Dependency]:
        result = []

        if self.requirements:
            result.append(RequirementsDependency(Path(self.requirements)))

        if self.project:
            result.append(ProjectDependency())

        if self.depends:
            for d in self.depends:
                if inspect.ismodule(d):
                    result.append(ModuleDependency(d))
                else:
                    result.append(PackageDependency(d))

        return result


class Application(ApplicationBase):
    def __init__(self, description: ty.Optional[str],
                 controls: ty.Optional[ty.List[Control]],
                 depends: ty.Optional[ty.Union[str, ModuleType, ty.List[ty.Union[str, ModuleType]]]],
                 requirements: ty.Optional[str],
                 project: bool,
                 sidebar: ty.Optional[Sidebar],
                 layout: ty.Optional[str],
                 columns: ty.Optional[int]):
        super().__init__("main", description, controls, depends, requirements, project, sidebar, layout, columns)
        self.description = description
        self.depends = depends
        self.requirements = requirements
        self.tabs = []

    def tab(self, title: str, description: ty.Optional[str] = None,
            controls: ty.Optional[ty.List[Control]] = None,
            depends: ty.Optional[ty.Union[str, ModuleType, ty.List[ty.Union[str, ModuleType]]]] = None,
            requirements: ty.Optional[str] = None,
            project: bool = False,
            layout: ty.Optional[str] = "grid",
            columns: ty.Optional[int] = 12):
        tab = ApplicationBase("main", description, controls, depends, requirements, project, None, layout, columns)
        self.tabs.append((title, tab))
        return tab

    def deploy(self, id: str, profile: str = "default", access: ty.Optional[str] = None):
        if len(self.tabs) > 0:
            _frame = frame(id, profile, access)
            counter = 0
            for title, _tab in self.tabs:
                _id = "a" + str(hash(title)) + str(counter)
                _app = Application(_tab.description, _tab.controls or self.controls,
                                   _tab.depends or self.depends,
                                   _tab.requirements or self.requirements,
                                   _tab.project or self.project,
                                   _tab._sidebar or self._sidebar,
                                   _tab.layout or self.layout,
                                   _tab.columns or self.columns)
                _app.merge_sidebar()
                _frame.add(_app, _app.description, params={_id: tab(title)})
                counter = counter + 1
            return _frame.push()
        else:
            _app = Application(self.description, self.controls, self.depends, self.requirements, self.project,
                               self._sidebar, self.layout, self.columns)
            _app.merge_sidebar()
            return push(id, _app, _app.description, access, profile=profile)

    def merge_sidebar(self):
        _controls = []
        if self._sidebar:
            _controls.extend(self._sidebar.controls)
        _controls.extend(self.controls)
        self.controls = _controls
