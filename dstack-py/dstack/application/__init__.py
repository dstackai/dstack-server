import inspect
import typing as ty
from pathlib import Path
from types import ModuleType

from dstack.application.dependencies import Dependency, RequirementsDependency, ProjectDependency, ModuleDependency, \
    PackageDependency


class Application:
    def __init__(self, controls: ty.List['Control'], outputs: ty.List['Output'],
                 depends: ty.Optional[ty.Union[str, ModuleType, ty.List[ty.Union[str, ModuleType]]]] = None,
                 requirements: ty.Optional[str] = None, project: bool = False):
        self.controls = controls
        self.depends = depends
        self.requirements = requirements
        self.project = project
        self.outputs = outputs

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
