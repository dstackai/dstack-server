import typing as ty
from abc import ABC, abstractmethod
from datetime import date, datetime
from pathlib import Path
from uuid import uuid4
from copy import copy

from dstack import md


class ValidationError(ValueError):
    def __init__(self, error: Exception, id: str):
        self.error = error
        self.id = id

    def __str__(self):
        return str(self.error)


class UpdateError(RuntimeError):
    def __init__(self, error: Exception, id: str):
        self.error = error
        self.id = id

    def __str__(self):
        return str(self.error)


T = ty.TypeVar("T", bound=list)


# TODO: Remove ty.Optional for the attributes where it's not needed
class View(ABC):
    def __init__(self, id: str,
                 enabled: ty.Optional[bool],
                 label: ty.Optional[str],
                 optional: ty.Optional[bool],
                 container: ty.Optional[str],
                 require_apply: ty.Optional[bool],
                 depends: ty.Optional[ty.List[str]],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int]):
        self.id = id
        self.enabled = enabled
        self.label = label
        self.optional = optional or False
        self.container = container
        self.depends = depends
        self.require_apply = require_apply
        self.visible = visible
        self.colspan = colspan
        self.rowspan = rowspan

    def pack(self) -> ty.Dict:
        result = {"id": self.id, "enabled": self.enabled, "label": self.label,
                  "visible": self.visible, "optional": self.optional,
                  "type": self.__class__.__name__}
        if self.container is not None:
            result["container"] = self.container
        if self.depends is not None and len(self.depends) > 0:
            result["depends"] = self.depends
        if self.require_apply:
            result["require_apply"] = self.require_apply
        if self.colspan is not None:
            result["colspan"] = self.colspan
        if self.rowspan is not None:
            result["rowspan"] = self.rowspan
        result.update(self._pack())
        return result

    @abstractmethod
    def _pack(self) -> ty.Dict:
        pass

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id})"


V = ty.TypeVar("V", bound=View)


# TODO: Remove ty.Optional for the attributes where it's not needed
class Control(ABC, ty.Generic[V]):
    def __init__(self,
                 label: ty.Optional[str],
                 id: ty.Optional[str],
                 depends: ty.Optional[ty.Union[ty.List['Control'], 'Control']],
                 handler: ty.Optional[ty.Callable[..., None]],
                 require_apply: bool,
                 optional: ty.Optional[bool],
                 container: ty.Optional[str],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int]
                 ):
        self.label = label
        self.enabled = True
        self.container = container
        self.visible = visible
        self.colspan = colspan
        self.rowspan = rowspan

        self._id = id or str(uuid4())
        self._parents = depends or []
        self._handler = handler
        self._require_apply = require_apply
        self.optional = optional
        self._pending_view: ty.Optional[V] = None
        self._dirty = True

        if not isinstance(self._parents, list):
            self._parents = [self._parents]

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self._id})"

    def get_id(self) -> str:
        return self._id

    def _update(self):
        if self._pending_view:
            self._apply(self._pending_view)
            self._pending_view = None
            self._dirty = True

        if self._handler:
            for p in self._parents:
                p._update()

            if self._dirty:
                try:
                    self._handler(self, *self._parents)
                    self._check_after_update()
                    self._dirty = False
                except Exception as e:
                    raise UpdateError(e, self._id)

    def is_dependent(self) -> bool:
        return len(self._parents) > 0

    def is_apply_required(self) -> bool:
        # return self.is_dependent() or self._require_apply
        return self._require_apply

    def view(self, apply: bool = False) -> V:
        if not self._require_apply or apply:
            self._update()
        return self._view()

    def apply(self, view: V):
        self._pending_view = view

    # TODO: Make it a property
    def value(self) -> ty.Any:
        self._update()
        return self._value()

    @abstractmethod
    def _view(self) -> V:
        pass

    @abstractmethod
    def _apply(self, view: V):
        pass

    def _check_after_update(self):
        pass

    @abstractmethod
    def _value(self) -> ty.Optional[ty.Any]:
        pass

    # TODO: Rethink after multiple outputs refactoring is done
    def _check_pickle(self):
        pass

    def __hash__(self):
        return hash(self.value())


class InputView(View):
    def __init__(self, id: str,
                 text: ty.Optional[str],
                 enabled: ty.Optional[bool],
                 label: ty.Optional[str],
                 optional: ty.Optional[bool],
                 container: ty.Optional[str],
                 require_apply: ty.Optional[bool],
                 depends: ty.Optional[ty.List[str]],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int]):
        super().__init__(id, enabled, label, optional, container, require_apply, depends, visible, colspan, rowspan)
        self.text = text

    def _pack(self) -> ty.Dict:
        _dict = {"data": self.text}
        return _dict


class OutputView(View):
    def __init__(self, id: str,
                 data: ty.Optional[str],
                 enabled: ty.Optional[bool],
                 label: ty.Optional[str],
                 optional: ty.Optional[bool],
                 container: ty.Optional[str],
                 require_apply: ty.Optional[bool],
                 depends: ty.Optional[ty.List[str]],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int]):
        super().__init__(id, enabled, label, optional, container, require_apply, depends, visible, colspan, rowspan)
        self.data = data

    def _pack(self) -> ty.Dict:
        _dict = {"data": self.data}
        return _dict


class CheckboxView(View):
    def __init__(self, id: str,
                 selected: bool,
                 enabled: ty.Optional[bool],
                 label: ty.Optional[str],
                 optional: ty.Optional[bool],
                 container: ty.Optional[str],
                 require_apply: ty.Optional[bool],
                 depends: ty.Optional[ty.List[str]],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int]):
        super().__init__(id, enabled, label, optional, container, require_apply, depends, visible, colspan, rowspan)
        self.selected = selected

    def _pack(self) -> ty.Dict:
        return {"selected": self.selected}


class Input(Control[InputView], ty.Generic[T]):
    def __init__(self,
                 text: ty.Union[ty.Optional[str], ty.Callable[[], str]],
                 handler: ty.Optional[ty.Callable[..., None]],
                 label: ty.Optional[str],
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]],
                 require_apply: bool,
                 optional: ty.Optional[bool],
                 container: ty.Optional[str],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int]
                 ):
        super().__init__(label, None, depends, handler, require_apply, optional, container, visible, colspan, rowspan)
        self.text = text

    def _view(self) -> InputView:
        if isinstance(self.text, str):
            text = self.text
        elif isinstance(self.text, ty.Callable):
            text = self.text()
        else:
            text = None
        return InputView(self._id, text, self.enabled, self.label, self.optional, self.container,
                         self._require_apply if self._require_apply else None,
                         [c.get_id() for c in self._parents], self.visible, self.colspan, self.rowspan)

    def _apply(self, view: InputView):
        assert isinstance(view, InputView)
        assert self._id == view.id
        self.text = view.text or ""

    def _value(self) -> ty.Optional[ty.Any]:
        # TODO: Check if data can be ty.Callable
        return self.text

    def _check_pickle(self):
        super()._check_pickle()

    def _check_after_update(self):
        pass


class Checkbox(Control[CheckboxView], ty.Generic[T]):
    def __init__(self,
                 selected: ty.Union[bool, ty.Callable[[], bool]],
                 handler: ty.Optional[ty.Callable[..., None]],
                 label: ty.Optional[str],
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]],
                 container: ty.Optional[str],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int]
                 ):
        super().__init__(label, None, depends, handler, False, False, container, visible, colspan, rowspan)
        self.selected = selected

    def _view(self) -> CheckboxView:
        if isinstance(self.selected, bool):
            selected = self.selected
        elif isinstance(self.selected, ty.Callable):
            selected = self.selected()
        return CheckboxView(self._id, selected, self.enabled, self.label, self.optional, self.container,
                            self._require_apply if self._require_apply else None,
                            [c.get_id() for c in self._parents], self.visible, self.colspan, self.rowspan)

    def _apply(self, view: CheckboxView):
        assert isinstance(view, CheckboxView)
        assert self._id == view.id
        self.selected = view.selected

    def _value(self) -> ty.Optional[ty.Any]:
        return self.selected


class ListModel(ABC, ty.Generic[T]):
    @abstractmethod
    def apply(self, data: T):
        pass

    @abstractmethod
    def size(self) -> int:
        pass

    @abstractmethod
    def element(self, index: int) -> ty.Any:
        pass

    @abstractmethod
    def title(self, index: int) -> str:
        pass

    def titles(self) -> ty.List[str]:
        result = []

        for i in range(0, self.size()):
            result.append(self.title(i))

        return result


class AbstractListModel(ListModel[T], ABC):
    def __init__(self, title_func: ty.Optional[ty.Callable[[ty.Any], str]] = None):
        self.items: ty.Optional[ty.List[ty.Any]] = None
        self.title_func = title_func

    def size(self) -> int:
        return len(self.items)

    def element(self, index: int) -> ty.Any:
        return self.items[index]

    def title(self, index: int) -> str:
        item = self.items[index]
        return self.title_func(item) if self.title_func else str(item)


class DefaultListModel(AbstractListModel[ty.List[ty.Any]]):
    def apply(self, items: ty.List[ty.Any]):
        self.items = items


class CallableListModel(AbstractListModel[ty.Callable[[], ty.List[ty.Any]]]):
    def apply(self, items: ty.Callable[[], ty.List[ty.Any]]):
        self.items = items()


class SelectView(View):
    def __init__(self, id: str,
                 selected: ty.Optional[ty.Union[int, ty.List[int]]],
                 titles: ty.Optional[ty.List[str]],
                 multiple: ty.Optional[bool],
                 enabled: ty.Optional[bool],
                 label: ty.Optional[str],
                 optional: ty.Optional[bool],
                 container: ty.Optional[str],
                 require_apply: ty.Optional[bool],
                 depends: ty.Optional[ty.List[str]],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int]):
        super().__init__(id, enabled, label, optional, container, require_apply, depends, visible, colspan, rowspan)
        self.titles = titles
        self.selected = selected
        self.multiple = multiple

    def _pack(self) -> ty.Dict:
        _dict = {"titles": self.titles}
        if self.selected is not None:
            _dict["selected"] = self.selected
        if self.multiple:
            _dict["multiple"] = True
        return _dict


class Select(Control[SelectView], ty.Generic[T]):
    def __init__(self,
                 items: ty.Union[ty.Optional[T], ty.Callable[[], T]],
                 handler: ty.Optional[ty.Callable[..., None]],
                 model: ty.Optional[ListModel[T]],
                 selected: ty.Optional[ty.Union[int, list]],
                 multiple: bool,
                 label: ty.Optional[str],
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]],
                 title: ty.Optional[ty.Callable[[T], str]],
                 container: ty.Optional[str],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int]
                 ):
        super().__init__(label, None, depends, handler, False, False, container, visible, colspan, rowspan)
        self.items = items
        self._model = model
        self.selected = selected or ([] if multiple else 0)
        self.multiple = multiple
        self.title = title
        if self.multiple:
            assert isinstance(self.selected, list)

    def _derive_model(self) -> ListModel[ty.Any]:
        if isinstance(self.items, list):
            return DefaultListModel(self.title)
        elif isinstance(self.items, ty.Callable):
            return CallableListModel(self.title)
        else:
            raise ValueError(f"Unsupported items type: {type(self.items)}")

    def get_model(self) -> ListModel[T]:
        model = self._model or self._derive_model()
        model.apply(self.items)
        return model

    def _view(self) -> SelectView:
        model = self.get_model()
        return SelectView(self._id, self.selected, model.titles(), True if self.multiple else None, self.enabled,
                          self.label, self.optional, self.container,
                          self._require_apply if self._require_apply else None,
                          [c.get_id() for c in self._parents], self.visible, self.colspan, self.rowspan)

    def _apply(self, view: SelectView):
        assert isinstance(view, SelectView)
        assert self._id == view.id
        if self.multiple:
            assert isinstance(self.selected, list)
        self.selected = view.selected

    def _value(self) -> ty.Optional[ty.Any]:
        model = self.get_model()
        if self.multiple:
            return [model.element(s) for s in self.selected]
        else:
            return model.element(self.selected) if self.selected is not None and self.selected >= 0 else None

    def _check_after_update(self):
        model = self.get_model()
        if self.multiple:
            assert isinstance(self.selected, list)
        if self.multiple:
            self.selected = [s for s in self.selected if s < model.size()]
        else:
            if self.selected is not None:
                if model.size() == 0:
                    self.selected = None
                elif self.selected >= model.size():
                    self.selected = 0

    def _check_pickle(self):
        super()._check_pickle()


class SliderView(View):
    def __init__(self, id: str,
                 selected: int,
                 values: ty.Optional[ty.List[float]],
                 enabled: ty.Optional[bool],
                 label: ty.Optional[str],
                 container: ty.Optional[str],
                 require_apply: ty.Optional[bool],
                 depends: ty.Optional[ty.List[str]],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int]):
        super().__init__(id, enabled, label, False, container, require_apply, depends, visible, colspan, rowspan)
        self.values = values
        self.selected = selected

    def _pack(self) -> ty.Dict:
        return {"data": self.values, "selected": self.selected}


class Slider(Control[SliderView]):
    def __init__(self,
                 values: ty.Optional[ty.Union[ty.Iterable[float], ty.Callable]],
                 handler: ty.Optional[ty.Callable[..., None]],
                 selected: int,
                 label: ty.Optional[str],
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]],
                 container: ty.Optional[str],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int],
                 require_apply: bool = False
                 ):
        super().__init__(label, None, depends, handler, require_apply, False, container, visible, colspan, rowspan)
        self.values = list(values) if values is not None else None
        self.selected = selected

    def _view(self) -> SliderView:
        return SliderView(self.get_id(), self.selected, self.values, self.enabled, self.label, self.container,
                          self._require_apply if self._require_apply else None,
                          [c.get_id() for c in self._parents], self.visible, self.colspan, self.rowspan)

    def _apply(self, view: SliderView):
        assert isinstance(view, SliderView)
        assert self._id == view.id
        self.selected = view.selected

    def _value(self) -> ty.Any:
        return self.values[self.selected]

    def _check_after_update(self):
        if len(self.values) == 0:
            self.selected = -1
        elif self.selected >= len(self.values):
            self.selected = 0

    def _check_pickle(self):
        super()._check_pickle()


class Upload:
    def __init__(self, id: str, file_name: str, length: int, created_date: date):
        self.id = id
        self.file_name = file_name
        self.length = length
        self.created_date = created_date

    def open(self, mode: str = 'r', buffering: ty.Optional[int] = None,
             encoding: ty.Optional[str] = None, errors: ty.Optional[str] = None,
             newline: ty.Optional[str] = None, closefd: bool = True) -> ty.IO:
        # TODO: Implement reading files by ID
        path = Path.home() / ".dstack" / "files" / "uploads" / str(self.created_date) / self.id
        if buffering is not None:
            return open(path, mode, buffering=buffering, encoding=encoding, errors=errors, newline=newline,
                        closefd=closefd)
        else:
            return open(path, mode, encoding=encoding, errors=errors, newline=newline, closefd=closefd)


class UploaderView(View):
    def __init__(self, id: str,
                 uploads: ty.List[Upload],
                 multiple: bool,
                 enabled: ty.Optional[bool],
                 label: ty.Optional[str],
                 optional: ty.Optional[bool],
                 container: ty.Optional[str],
                 require_apply: ty.Optional[bool],
                 depends: ty.Optional[ty.List[str]],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int]):
        super().__init__(id, enabled, label, optional, container, require_apply, depends, visible, colspan, rowspan)
        self.uploads = uploads
        self.multiple = multiple

    def _pack(self) -> ty.Dict:
        uploads_d = {
            "uploads": [{"id": u.id, "file_name": u.file_name, "length": u.length,
                         "created_date": u.created_date.strftime("%Y-%m-%d")} for u in self.uploads]
        }
        if self.multiple:
            uploads_d["multiple"] = True
        return uploads_d


class Uploader(Control[UploaderView]):
    def __init__(self,
                 uploads: ty.Union[ty.Optional[ty.List[Upload]], ty.Callable[[], ty.List[Upload]]],
                 multiple: bool,
                 label: ty.Optional[str],
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]],
                 handler: ty.Optional[ty.Callable[..., None]],
                 optional: ty.Optional,
                 container: ty.Optional[str],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int]
                 ):
        super().__init__(label, None, depends, handler, False, optional, container, visible, colspan, rowspan)
        self.uploads: ty.Union[ty.List[Upload], ty.Callable[[], ty.List[Upload]]] = uploads if uploads else []
        self.multiple = multiple

    def _view(self) -> UploaderView:
        if isinstance(self.uploads, list):
            uploads = self.uploads
        elif isinstance(self.uploads, ty.Callable):
            uploads = self.uploads()
        return UploaderView(self.get_id(), uploads, self.multiple, self.enabled, self.label,
                            self.optional, self.container,
                            self._require_apply if self._require_apply else None,
                            [c.get_id() for c in self._parents], self.visible, self.colspan, self.rowspan)

    def _apply(self, view: UploaderView):
        assert isinstance(view, UploaderView)
        assert self._id == view.id
        self.uploads = view.uploads

    def _value(self) -> ty.List[Upload]:
        # TODO: Check if uploads can be ty.Callable
        return self.uploads

    def _check_pickle(self):
        super()._check_pickle()


# TODO: Decode automatically
def unpack_view(source: ty.Dict) -> View:
    type = source["type"]
    if type == "InputView":
        return InputView(source["id"], source.get("data"), source.get("enabled"),
                         source.get("label"), source.get("optional"), source.get("container"),
                         source.get("require_apply"), source.get("depends"),
                         source.get("visible") is not False, source.get("colspan"), source.get("rowspan"))
    if type == "CheckboxView":
        return CheckboxView(source["id"], source.get("selected"), source.get("enabled"), source.get("label"),
                            source.get("optional"), source.get("container"),
                            source.get("require_apply"), source.get("depends"),
                            source.get("visible") is not False, source.get("colspan"), source.get("rowspan"))
    elif type == "SelectView":
        selected = source.get("selected")
        multiple = source.get("multiple")
        if multiple:
            if selected is None:
                selected = []
            elif isinstance(selected, int):
                selected = [selected]
        return SelectView(source["id"], selected, source.get("titles"), multiple,
                          source.get("enabled"), source.get("label"), source.get("optional"), source.get("container"),
                          source.get("require_apply"), source.get("depends"),
                          source.get("visible") is not False, source.get("colspan"), source.get("rowspan"))
    elif type == "SliderView":
        return SliderView(source["id"], source.get("selected"), source.get("data"), source.get("enabled"),
                          source.get("label"), source.get("container"),
                          source.get("require_apply"), source.get("depends"),
                          source.get("visible") is not False, source.get("colspan"), source.get("rowspan"))
    elif type == "UploaderView":
        uploads = [Upload(u["id"], u.get("file_name"), u.get("length"),
                          datetime.strptime(u["created_date"], "%Y-%m-%d").date()) for u in source["uploads"]]
        return UploaderView(source["id"], uploads, source.get("multiple"), source.get("enabled"),
                            source.get("label"), source.get("optional"), source.get("container"),
                            source.get("require_apply"), source.get("depends"),
                            source.get("visible") is not False, source.get("colspan"), source.get("rowspan"))
    elif type == "OutputView":
        return OutputView(source["id"], source.get("data"), source.get("enabled"), source.get("label"),
                          source.get("optional"), source.get("container"),
                          source.get("require_apply"), source.get("depends"),
                          source.get("visible") is not False, source.get("colspan"), source.get("rowspan"))
    else:
        raise AttributeError("Unsupported view: " + str(source))


class Output(Control[OutputView], ty.Generic[T]):

    def __init__(self,
                 data: ty.Union[ty.Optional[ty.Any], ty.Callable[[], ty.Any]],
                 handler: ty.Optional[ty.Callable[..., None]],
                 label: ty.Optional[str],
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]],
                 container: ty.Optional[str],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int],
                 require_apply: bool):
        super().__init__(label, None, depends, handler, require_apply, False, container, visible, colspan, rowspan)
        self.data = data

    def _view(self) -> V:
        if isinstance(self.data, ty.Callable):
            data = self.data()
        else:
            data = self.data
        return OutputView(self._id, data, self.enabled, self.label, self.optional, self.container,
                          self._require_apply if self._require_apply else None,
                          [c.get_id() for c in self._parents], self.visible, self.colspan, self.rowspan)

    def _apply(self, view: V):
        pass

    def _value(self) -> ty.Optional[ty.Any]:
        if isinstance(self.data, ty.Callable):
            data = self.data()
        else:
            data = self.data
        return data


class Markdown(Output, ty.Generic[T]):
    def __init__(self,
                 text: ty.Union[ty.Optional[str], ty.Callable[[], str]],
                 handler: ty.Optional[ty.Callable[..., None]],
                 label: ty.Optional[str],
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]],
                 container: ty.Optional[str],
                 visible: bool,
                 colspan: ty.Optional[int],
                 rowspan: ty.Optional[int],
                 require_apply: bool):
        super().__init__(
            (md.Markdown(text) if isinstance(text, str) else lambda: md.Markdown(
                text())) if text is not None else None, handler, label, depends, container, visible,
            colspan, rowspan, require_apply)
        self.text = text

    def _check_after_update(self):
        if isinstance(self.text, str):
            self.data = md.Markdown(self.text)


class Container(object):
    def __init__(self, id: ty.Optional[str],
                 layout: ty.Optional[str],
                 columns: ty.Optional[int]):
        self.id = id
        self.layout = layout
        self.columns = columns

    def pack(self) -> dict:
        _dict = {"id": self.id, "layout": self.layout}
        if self.columns:
            _dict["columns"] = self.columns
        return _dict


# TODO: Merge Application and Controller
class Controller(object):
    def __init__(self, controls: ty.List[Control],
                 containers: ty.List[Container]):
        self.controls_by_id: ty.Dict[str, Control] = {}
        self.copy_of_controls_by_id = None
        # TODO: Validate controls and container (container IDs are valid and that there are no containers
        #  without controls)
        self.containers = containers

        self.require_apply = False

        for control in controls:
            if control.is_apply_required():
                self.require_apply = True

            self.controls_by_id[control.get_id()] = control

        self._ids = [x.get_id() for x in controls]

    def copy_controls_by_id(self) -> ty.Dict:
        map_copy = dict(self.controls_by_id)

        for c_id in self._ids:
            map_copy[c_id] = copy(map_copy[c_id])

        for c in map_copy.values():
            for i in range(len(c._parents)):
                c._parents[i] = map_copy[c._parents[i]._id]

        return map_copy

    def list(self, views: ty.Optional[ty.List[View]] = None, apply: bool = False) -> ty.List[View]:
        views = views or []

        self.copy_of_controls_by_id = self.copy_controls_by_id()

        for view in views:
            self.copy_of_controls_by_id[view.id].apply(view)
        values = [c.view(apply or not self.require_apply) for c in self.copy_of_controls_by_id.values()]

        self.copy_of_controls_by_id = None

        return values

    def _check_pickle(self):
        pass

    def init(self):
        self._check_pickle()

        for c in self.controls_by_id.values():
            c._check_pickle()
            for i in range(len(c._parents)):
                c._parents[i] = self.controls_by_id[c._parents[i]._id]
