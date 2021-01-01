import os
import shutil
import typing as ty
from abc import ABC, abstractmethod
from pathlib import Path
from types import ModuleType

from pkg_resources import get_distribution


class NoSuchModuleError(ValueError):
    def __init__(self, module: str):
        self.module = module

    def __str__(self):
        return f"Module f{self.module} not found"


def _find_project_root(wd: Path) -> Path:
    if "__init__.py" not in os.listdir(wd):
        return wd
    else:
        return _find_project_root(wd.parent)


def _working_directory():
    def _get_wd() -> ty.Optional[Path]:
        f = getattr(globals(), "__file__", None)
        return Path(f).parent if f else None

    def _get_wd_jupyter() -> ty.Optional[Path]:
        dh = getattr(globals(), "_dh", None)
        return Path(dh[0]) if dh else None

    def _get_cwd() -> Path:
        return Path(os.getcwd())

    return _get_wd() or _get_wd_jupyter() or _get_cwd()


def _project_root():
    return _find_project_root(_working_directory())


class AbstractSource(ABC):
    @abstractmethod
    def stage(self, root: Path):
        pass


class AnyFile(AbstractSource):
    def __init__(self, relative: Path, absolute: Path):
        self.relative = relative
        self.absolute = absolute

    def stage(self, root: Path):
        target = root / self.relative

        if not target.parent.exists():
            target.parent.mkdir(parents=True)

        shutil.copy(self.absolute, root / self.relative)


class Source(AnyFile):
    pass


class WheelFile(AnyFile):
    def __init__(self, absolute: Path):
        super().__init__(Path("wheels") / absolute.name, absolute)


class MergeableSource(AbstractSource):
    def __init__(self, relative: Path, lines: ty.List[str]):
        self.relative = relative
        self.lines = lines

    def stage(self, root: Path):
        path = root / self.relative

        if not path.parent.exists():
            path.parent.mkdir(parents=True)

        text = path.read_text() + "\n" if path.exists() else ""
        text += "\n".join(self.lines)
        path.write_text(text)


class DownloadablePackage(MergeableSource):
    def __init__(self, package: str):
        super().__init__(Path("requirements.txt"), [_specify_package_version_if_needed(package)])


class Requirements(MergeableSource):
    def __init__(self, path: Path):
        super().__init__(Path("requirements.txt"), (_project_root() / path).read_text().splitlines())


class Dependency(ABC):
    @abstractmethod
    def collect(self) -> ty.List[AbstractSource]:
        pass


class RequirementsDependency(Dependency):
    def __init__(self, file: Path):
        self.file = file

    def collect(self) -> ty.List[AbstractSource]:
        return [Requirements(self.file)]

    def __repr__(self):
        return f"{self.__class__.__name__}('{self.file}')"


class ModuleDependency(Dependency):
    def __init__(self, module: ModuleType):
        self.module = module

    def collect(self) -> ty.List[AbstractSource]:
        module_sources = _get_sources_for(self.module.__name__)

        if len(module_sources) == 0:
            raise NoSuchModuleError(self.module.__name__)

        return module_sources

    def __repr__(self):
        return f"{self.__class__.__name__}('{self.module}')"


class PackageDependency(Dependency):
    def __init__(self, package: str):
        self.package = package

    def collect(self) -> ty.List[AbstractSource]:
        local_package = _get_sources_for(self.package)
        return local_package if len(local_package) > 0 else [DownloadablePackage(self.package)]

    def __repr__(self):
        return f"{self.__class__.__name__}('{self.package}')"


class WheelDependency(Dependency):
    def __init__(self, absolute: Path):
        self.absolute = absolute

    def collect(self) -> ty.List[AbstractSource]:
        return [WheelFile(self.absolute)]


def _collect_sources(root: Path, path: Path) -> ty.List[Source]:
    result = []
    for f in os.listdir(path):
        file = path / Path(f)
        relative_path = file.relative_to(root)
        if file.suffix == ".py":
            result.append(Source(relative_path, file))
        elif file.is_dir() and not file.name.startswith("."):
            result += _collect_sources(root, file)
    return result


def _get_sources_for(prefix: str) -> ty.List[Source]:
    root = _project_root()
    project = _collect_sources(root, root)
    return [source for source in project if str(source.relative).startswith(prefix.replace(".", os.path.sep))]


class ProjectDependency(Dependency):
    def __repr__(self):
        return f"{self.__class__.__name__}()"

    def collect(self) -> ty.List[AbstractSource]:
        wd = _working_directory()
        project_root = _find_project_root(wd)
        return _collect_sources(project_root, project_root)


def _specify_package_version_if_needed(package: str) -> str:
    return package if "==" in package else f"{package}=={get_distribution(package).version}"
