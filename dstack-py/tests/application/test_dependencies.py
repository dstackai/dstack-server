import os
import shutil
from pathlib import Path
from tempfile import gettempdir
from unittest import TestCase

from dstack.application.handlers import _stage_deps
from dstack.controls import TextField, Output
from dstack import app
from tests.application.test_package.mymodule import test_app


class TestDependencies(TestCase):
    @staticmethod
    def _get_temp_dir(path: str = "") -> Path:
        return Path(gettempdir()) / "test_deps" / path

    def setUp(self):
        temp_base = self._get_temp_dir()
        if temp_base.exists():
            shutil.rmtree(temp_base)

    def test_simple(self):
        def update(control: TextField, text_field: TextField):
            control.data = str(int(text_field.data) * 2)

        c1 = TextField("10", id="c1")
        c2 = TextField(id="c2", depends=c1, handler=update)

        o1 = Output(test_app, depends=[c1, c2])
        my_app = app(controls=[c1, c2, o1], requirements="tests/application/test_requirements.txt",
                     depends=["deprecation", "PyYAML==5.3.1", "tests.application.test_package"])

        deps = my_app.deps()
        print(deps)
        stage_dir = self._get_temp_dir("stage1")
        print(stage_dir)
        _stage_deps(deps, stage_dir)
        self.tree_view(stage_dir)

    @staticmethod
    def tree_view(root: Path):
        def traverse(path: Path, indent: str = ""):
            for f in os.listdir(path):
                file = path / Path(f)
                print(f"{indent}|-{file.name}")
                if file.is_dir():
                    traverse(file, indent + "\t")

        print(f"/-{root.name}")
        traverse(root, "\t")
