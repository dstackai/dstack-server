import inspect
import sys
import typing as ty
from pathlib import Path
from types import ModuleType

from dstack.application.dependencies import Dependency, RequirementsDependency, ProjectDependency, ModuleDependency, \
    PackageDependency


class Application:
    def __init__(self, handler,
                 depends: ty.Optional[ty.Union[str, ModuleType, ty.List[ty.Union[str, ModuleType]]]] = None,
                 requirements: ty.Optional[str] = None, project: bool = False, **kwargs):
        self.controls = kwargs
        self.depends = depends
        self.requirements = requirements
        self.project = project
        self.handler = self.decorator(handler)

    def dep(self) -> ty.List[Dependency]:
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

    def decorator(self, func):
        if hasattr(func, "__depends__"):
            func.__depends__ += self.dep()
        else:
            func.__depends__ = self.dep()

        if func.__module__ != "__main__":
            module = sys.modules[func.__module__]
            func.__depends__.append(ModuleDependency(module))

        return func
