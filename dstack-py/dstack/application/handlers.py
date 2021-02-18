import shutil
import typing as ty
from pathlib import Path
from tempfile import gettempdir

import cloudpickle

import dstack.util as util
from dstack.handler import EncoderFactory, Encoder, FrameData
from dstack.controls import Controller, Container
from dstack.application.dependencies import Dependency
from dstack.content import FileContent, MediaType

from typing import Any


class AppEncoderFactory(EncoderFactory):
    def accept(self, obj: Any) -> bool:
        return self.is_type(obj, "dstack.Application")

    def create(self) -> Encoder[Any]:
        return AppEncoder()


class AppEncoder(Encoder['Application']):
    def __init__(self, temp_dir: ty.Optional[str] = None, archive: str = "zip"):
        super().__init__()
        self._temp_dir = Path(temp_dir or gettempdir())
        self._archive = archive

    def encode(self, app: 'Application', description: ty.Optional[str], params: ty.Optional[ty.Dict]) -> FrameData:
        containers = []
        if app._sidebar:
            containers.append(Container(app._sidebar.id, app._sidebar.layout, app._sidebar.columns))
        containers.append(Container(app.id, app.layout, app.columns))
        controller = Controller(app.controls, containers, app.require_apply)

        stage_dir = util.create_path(self._temp_dir)

        _stage_deps(app.deps(), stage_dir)

        _serialize(controller, stage_dir / "controller.pickle")

        archived = util.create_filename(self._temp_dir)
        filename = shutil.make_archive(archived, self._archive, stage_dir)

        settings = {"cloudpickle": cloudpickle.__version__, "archive": self._archive}

        return FrameData(FileContent(Path(filename)),
                         MediaType("application/octet-stream", "application/python"),
                         description, params, settings)


def _serialize(obj: ty.Any, path: Path):
    with path.open(mode="wb") as f:
        cloudpickle.dump(obj, f)


def _stage_deps(deps: ty.List[Dependency], root: Path):
    # Function stages dependencies in one place on disk
    # root
    # |- project
    #       |- package1
    #           |- package1.1
    #               |- module1.py
    #               |- ...
    #           |- package1.2
    #           |- ...
    #       |- package2
    #       |- ...
    # |- wheels
    #       |- my_wheel_package1.whl
    #       |- my_wheel_package2.whl
    # |- requirements.txt

    deps = _clear_deps(deps)
    for dep in deps:
        for source in dep.collect():
            source.stage(root)

    # if dependency list is empty we need to make the directory anyway
    if len(deps) == 0:
        root.mkdir(parents=True)


def _clear_deps(deps: ty.List[Dependency]) -> ty.List[Dependency]:
    # Remove modules if project dependency exists
    # Deduplicate package deps
    return deps


def _save_data(data: FrameData, filename: ty.Optional[Path] = None, temp_dir: ty.Optional[str] = None) -> Path:
    temp_dir = temp_dir or gettempdir()
    filename = filename or util.create_path(temp_dir)

    path = Path(filename)

    if path.exists():
        shutil.rmtree(filename)

    path.mkdir(parents=True)

    archived = util.create_filename(temp_dir)

    with data.data.stream() as stream:
        with open(archived, "wb") as f:
            f.write(stream.read())

    archive = data.settings["archive"]
    shutil.unpack_archive(archived, extract_dir=str(filename), format=archive)

    return filename
