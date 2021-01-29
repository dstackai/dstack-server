import typing as ty
from abc import ABC, abstractmethod
from datetime import date, datetime
from uuid import uuid4
from copy import copy


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


class View(ABC):
    def __init__(self, id: str, enabled: ty.Optional[bool], label: ty.Optional[str], optional: ty.Optional[bool]):
        self.id = id
        self.enabled = enabled
        self.label = label
        self.optional = optional or False

    def pack(self) -> ty.Dict:
        result = {"id": self.id, "enabled": self.enabled, "label": self.label,
                  "optional": self.optional, "type": self.__class__.__name__}
        result.update(self._pack())
        return result

    @abstractmethod
    def _pack(self) -> ty.Dict:
        pass

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id})"


V = ty.TypeVar("V", bound=View)


# TODO: Add position: ControlPosition[DEFAULT|SIDEBAR|HEADER|ONE_COLUMN|TWO_COLUMNS)
# TODO: Extract Input(Control[V]):
class Control(ABC, ty.Generic[V]):
    def __init__(self,
                 label: ty.Optional[str],
                 id: ty.Optional[str],
                 depends: ty.Optional[ty.Union[ty.List['Control'], 'Control']],
                 handler: ty.Optional[ty.Callable[..., None]],
                 require_apply: bool,
                 optional: ty.Optional[bool]
                 ):
        self.label = label
        self.enabled = True

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

    def get_id(self):
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

    def view(self) -> V:
        self._update()
        return self._view()

    def apply(self, view: V):
        self._pending_view = view

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
        if hasattr(self, '_update_func'):
            self._handler = getattr(self, '_update_func')

    def __hash__(self):
        return hash(self.value())


class TextFieldView(View):
    def __init__(self, id: str,
                 text: ty.Optional[str],
                 long: ty.Optional[bool] = None,
                 enabled: ty.Optional[bool] = None,
                 label: ty.Optional[str] = None,
                 optional: ty.Optional[bool] = None):
        super().__init__(id, enabled, label, optional)
        self.text = text
        self.long = long

    def _pack(self) -> ty.Dict:
        _dict = {"data": self.text}
        if self.long:
            _dict["long"] = True
        return _dict


class CheckBoxView(View):
    def __init__(self, id: str, selected: bool, enabled: ty.Optional[bool] = None,
                 label: ty.Optional[str] = None, optional: ty.Optional[bool] = None):
        super().__init__(id, enabled, label, optional)
        self.selected = selected

    def _pack(self) -> ty.Dict:
        return {"selected": self.selected}


class TextField(Control[TextFieldView], ty.Generic[T]):
    def __init__(self,
                 text: ty.Union[ty.Optional[str], ty.Callable[[], str]] = None,
                 handler: ty.Optional[ty.Callable[..., None]] = None,
                 long: bool = False,
                 label: ty.Optional[str] = None,
                 id: ty.Optional[str] = None,
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None,
                 require_apply: bool = True,
                 optional: ty.Optional[bool] = None,
                 data: ty.Union[ty.Optional[str], ty.Callable[[], str]] = None,
                 ):
        super().__init__(label, id, depends, handler, require_apply, optional)
        if data is not None:
            print("The attribute data is deprecated, use text.")
        self.text = text if text is not None else data
        self.long = long

    def _view(self) -> TextFieldView:
        if isinstance(self.text, str):
            text = self.text
        elif isinstance(self.text, ty.Callable):
            text = self.text()
        else:
            text = None
        return TextFieldView(self._id, text, True if self.long else None, self.enabled, self.label, self.optional)

    def _apply(self, view: TextFieldView):
        assert isinstance(view, TextFieldView)
        assert self._id == view.id
        self.text = view.text

    def _value(self) -> ty.Optional[ty.Any]:
        # TODO: Check if data can be ty.Callable
        return self.text

    def _check_pickle(self):
        super()._check_pickle()
        if not hasattr(self, 'text'):
            self.text = getattr(self, 'data') if hasattr(self, 'data') else None
        if not hasattr(self, 'long'):
            self.long = None

    def _check_after_update(self):
        if hasattr(self, "data"):
            print("The attribute data is deprecated, use text.")
            self.text = getattr(self, "data")


class CheckBox(Control[CheckBoxView], ty.Generic[T]):
    def __init__(self,
                 selected: ty.Union[bool, ty.Callable[[], bool]] = False,
                 handler: ty.Optional[ty.Callable[..., None]] = None,
                 label: ty.Optional[str] = None,
                 id: ty.Optional[str] = None,
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None,
                 require_apply: bool = False
                 ):
        super().__init__(label, id, depends, handler, require_apply, False)
        self.selected = selected

    def _view(self) -> CheckBoxView:
        if isinstance(self.selected, bool):
            selected = self.selected
        elif isinstance(self.selected, ty.Callable):
            selected = self.selected()
        return CheckBoxView(self._id, selected, self.enabled, self.label, self.optional)

    def _apply(self, view: CheckBoxView):
        assert isinstance(view, CheckBoxView)
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


class ComboBoxView(View):
    def __init__(self, id: str, selected: ty.Optional[ty.Union[int, ty.List[int]]],
                 titles: ty.Optional[ty.List[str]] = None, multiple: ty.Optional[bool] = None,
                 enabled: ty.Optional[bool] = None, label: ty.Optional[str] = None, optional: ty.Optional[bool] = None):
        super().__init__(id, enabled, label, optional)
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


class ComboBox(Control[ComboBoxView], ty.Generic[T]):
    def __init__(self,
                 items: ty.Union[ty.Optional[T], ty.Callable[[], T]] = None,
                 handler: ty.Optional[ty.Callable[..., None]] = None,
                 model: ty.Optional[ListModel[T]] = None,
                 selected: ty.Optional[ty.Union[int, list]] = None,
                 multiple: bool = False,
                 label: ty.Optional[str] = None,
                 id: ty.Optional[str] = None,
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None,
                 title: ty.Optional[ty.Callable[[T], str]] = None,
                 require_apply: bool = False,
                 optional: ty.Optional[bool] = None,
                 data: ty.Union[ty.Optional[T], ty.Callable[[], T]] = None
                 ):
        super().__init__(label, id, depends, handler, require_apply, optional)
        if data is not None:
            print("The attribute data is deprecated, use items.")
        self.items = items if items is not None else data
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

    def _view(self) -> ComboBoxView:
        model = self.get_model()
        return ComboBoxView(self._id, self.selected, model.titles(), True if self.multiple else None, self.enabled,
                            self.label,
                            self.optional)

    def _apply(self, view: ComboBoxView):
        assert isinstance(view, ComboBoxView)
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
        if hasattr(self, "data"):
            print("The attribute data is deprecated, use items.")
            self.items = getattr(self, "data")
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
        if not hasattr(self, 'items'):
            self.items = getattr(self, 'data') if hasattr(self, 'data') else None
        if not hasattr(self, 'multiple'):
            self.multiple = False


class SliderView(View):
    def __init__(self, id: str, selected: int = 0, values: ty.Optional[ty.List[float]] = None,
                 enabled: ty.Optional[bool] = None, label: ty.Optional[str] = None):
        super().__init__(id, enabled, label, False)
        self.values = values
        self.selected = selected

    def _pack(self) -> ty.Dict:
        return {"data": self.values, "selected": self.selected}


class Slider(Control[SliderView]):
    def __init__(self,
                 values: ty.Optional[ty.Union[ty.Iterable[float], ty.Callable]] = None,
                 handler: ty.Optional[ty.Callable[..., None]] = None,
                 selected: int = 0,
                 label: ty.Optional[str] = None,
                 id: ty.Optional[str] = None,
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None,
                 require_apply: bool = True,
                 data: ty.Optional[ty.Union[ty.Iterable[float], ty.Callable]] = None
                 ):
        super().__init__(label, id, depends, handler, require_apply, False)
        if data is not None:
            print("The attribute data is deprecated, use values.")
        self.values = list(values) if values is not None else list(data)
        self.selected = selected

    def _view(self) -> SliderView:
        return SliderView(self.get_id(), self.selected, self.values, self.enabled, self.label)

    def _apply(self, view: SliderView):
        assert isinstance(view, SliderView)
        assert self._id == view.id
        self.selected = view.selected

    def _value(self) -> ty.Any:
        return self.values[self.selected]

    def _check_after_update(self):
        if hasattr(self, "data"):
            print("The attribute data is deprecated, use values.")
            self.values = getattr(self, "data")
        if len(self.values) == 0:
            self.selected = -1
        elif self.selected >= len(self.values):
            self.selected = 0

    def _check_pickle(self):
        super()._check_pickle()
        if not hasattr(self, 'values'):
            self.values = getattr(self, 'data') if hasattr(self, 'data') else None


class Upload:
    def __init__(self, id: str, file_name: str, length: int, created_date: date):
        self.id = id
        self.file_name = file_name
        self.length = length
        self.created_date = created_date

    def stream(self) -> ty.IO:
        # TODO: As a workaround, read the file directly from /files/uploads/{created_date}/{id}
        # TODO: Implement reading files by ID
        pass


class FileUploaderView(View):
    def __init__(self, id: str, uploads: ty.List[Upload], multiple: bool, enabled: ty.Optional[bool] = None,
                 label: ty.Optional[str] = None, optional: ty.Optional[bool] = None):
        super().__init__(id, enabled, label, optional)
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


class FileUploader(Control[FileUploaderView]):
    def __init__(self,
                 uploads: ty.Union[ty.Optional[ty.List[Upload]], ty.Callable[[], ty.List[Upload]]] = None,
                 multiple: bool = False,
                 label: ty.Optional[str] = None,
                 id: ty.Optional[str] = None,
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None,
                 handler: ty.Optional[ty.Callable[..., None]] = None,
                 require_apply: bool = False,
                 optional: ty.Optional = None
                 ):
        super().__init__(label, id, depends, handler, require_apply, optional)
        self.uploads: ty.Union[ty.List[Upload], ty.Callable[[], ty.List[Upload]]] = uploads if uploads else []
        self.multiple = multiple

    def _view(self) -> FileUploaderView:
        if isinstance(self.uploads, list):
            uploads = self.uploads
        elif isinstance(self.uploads, ty.Callable):
            uploads = self.uploads()
        return FileUploaderView(self.get_id(), uploads, self.multiple, self.enabled, self.label, self.optional)

    def _apply(self, view: FileUploaderView):
        assert isinstance(view, FileUploaderView)
        assert self._id == view.id
        self.uploads = view.uploads

    def _value(self) -> ty.List[Upload]:
        # TODO: Check if uploads can be ty.Callable
        return self.uploads

    def _check_pickle(self):
        super()._check_pickle()
        if not hasattr(self, 'uploads'):
            self.uploads = getattr(self, 'data') if hasattr(self, 'data') else None


# TODO: Decode automatically
def unpack_view(source: ty.Dict) -> View:
    type = source["type"]
    if type == "TextFieldView":
        return TextFieldView(source["id"], source.get("data"), source.get("long"), source.get("enabled"),
                             source.get("label"), source.get("optional"))
    if type == "CheckBoxView":
        return CheckBoxView(source["id"], source.get("selected"), source.get("enabled"), source.get("label"),
                            source.get("optional"))
    elif type == "ApplyView":
        return ApplyView(source["id"], source.get("enabled"), source.get("label"), source.get("optional"))
    elif type == "ComboBoxView":
        selected = source.get("selected")
        multiple = source.get("multiple")
        if multiple:
            if selected is None:
                selected = []
            elif isinstance(selected, int):
                selected = [selected]
        return ComboBoxView(source["id"], selected, source.get("titles"), multiple,
                            source.get("enabled"), source.get("label"), source.get("optional"))
    elif type == "SliderView":
        return SliderView(source["id"], source.get("selected"), source.get("data"), source.get("enabled"),
                          source.get("label"))
    elif type == "FileUploaderView":
        uploads = [Upload(u["id"], u["file_name"], u["length"],
                          datetime.strptime(u["created_date"], "%Y-%m-%d").date()) for u in source["uploads"]]
        return FileUploaderView(source["id"], uploads, source.get("multiple"), source.get("enabled"),
                                source.get("label"), source.get("optional"))
    else:
        raise AttributeError("Unsupported view: " + str(source))


class ApplyView(View):
    def _pack(self) -> ty.Dict:
        return {}


class Apply(Control[ApplyView]):
    def __init__(self, label: ty.Optional[str] = None, id: ty.Optional[str] = None):
        super().__init__(label, id, None, None, False, False)
        self.controller: ty.Optional[Controller] = None

    def _view(self) -> ApplyView:
        enabled = True

        for control in self.controller.copy_of_controls_by_id.values():
            if control._id != self.get_id() and (not control.optional and control.value() is None):
                enabled = False
                break

        return ApplyView(self.get_id(), enabled, self.label, False)

    def _apply(self, view: ApplyView):
        assert isinstance(view, ApplyView)
        assert self._id == view.id

    def _value(self) -> ty.Optional[ty.Any]:
        return None


# TODO: Add position: OutputPosition[DEFAULT|ONE_COLUMN|TWO_COLUMNS)
class Output(ABC, ty.Generic[T]):
    def __init__(self,
                 data: ty.Union[ty.Optional[ty.Any], ty.Callable[[], ty.Any]] = None,
                 handler: ty.Optional[ty.Callable[..., None]] = None,
                 label: ty.Optional[str] = None,
                 id: ty.Optional[str] = None,
                 depends: ty.Optional[ty.Union[ty.List[Control], Control]] = None):
        self.label = label
        self.data = data

        self._handler = handler
        self._id = id or str(uuid4())
        self._parents = depends

        if self._parents is not None and not isinstance(self._parents, list):
            self._parents = [self._parents]


class Controller(object):
    def __init__(self, controls: ty.List[Control], outputs: ty.List[Output]):
        self.controls_by_id: ty.Dict[str, Control] = {}
        self.copy_of_controls_by_id = None
        self._outputs = outputs

        require_apply = False
        has_apply = False

        for control in controls:
            require_apply = True if control.is_apply_required() else require_apply

            if isinstance(control, Apply):
                if not has_apply:
                    has_apply = True
                    control.controller = self
                else:
                    raise ValueError("Apply must appear only once")

            self.controls_by_id[control.get_id()] = control

        if require_apply and not has_apply:
            apply = Apply()
            apply.controller = self
            self.controls_by_id[apply.get_id()] = apply

        self._ids = [x.get_id() for x in controls]

    def copy_controls_by_id(self) -> ty.Dict:
        map_copy = dict(self.controls_by_id)

        for c_id in self._ids:
            map_copy[c_id] = copy(map_copy[c_id])

        for c in map_copy.values():
            for i in range(len(c._parents)):
                c._parents[i] = map_copy[c._parents[i]._id]

        return map_copy

    def list(self, views: ty.Optional[ty.List[View]] = None) -> ty.List[View]:
        views = views or []

        self.copy_of_controls_by_id = self.copy_controls_by_id()

        for view in views:
            self.copy_of_controls_by_id[view.id].apply(view)
        values = [c.view() for c in self.copy_of_controls_by_id.values()]

        self.copy_of_controls_by_id = None

        return values

    def apply(self, views: ty.List[View]) -> ty.Any:
        self.copy_of_controls_by_id = self.copy_controls_by_id()

        for view in views:
            control = self.copy_of_controls_by_id[view.id]
            control.apply(view)
            control._update()

        copy_of_outputs = [copy(o) for o in self._outputs]
        for o in copy_of_outputs:
            ids = [c._id for c in o._parents] if o._parents is not None else self._ids
            values = [self.copy_of_controls_by_id[c_id] for c_id in ids]
            if o._handler:
                o._handler(o, *values)
            if isinstance(o.data, ty.Callable):
                o.data = o.data()

        self.copy_of_controls_by_id = None

        return copy_of_outputs

    def _check_pickle(self):
        if hasattr(self, 'map'):
            self.controls_by_id = getattr(self, 'map')

    def init(self):
        self._check_pickle()

        for c in self.controls_by_id.values():
            c._check_pickle()
            for i in range(len(c._parents)):
                c._parents[i] = self.controls_by_id[c._parents[i]._id]

        if hasattr(self, '_outputs'):
            for o in self._outputs:
                if o._parents is not None:
                    for i in range(len(o._parents)):
                        o._parents[i] = self.controls_by_id[o._parents[i]._id]
