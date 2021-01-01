import os
import shutil
import subprocess
import sys
import typing as ty
from pathlib import Path
from tempfile import gettempdir
from textwrap import dedent
from unittest import TestCase

import dstack.controls as ctrl
import dstack.application.dependencies as dp
import dstack.util as util
from dstack import app
from dstack.application.handlers import AppEncoder
from dstack.handler import FrameData
from dstack.version import __version__ as dstack_version
from tests.application.test_package.mymodule import test_app, foo


class TestApp(TestCase):
    class Env(object):
        def __init__(self, path: Path):
            self.path = path

            if path.exists():
                shutil.rmtree(str(path))

            subprocess.run([sys.executable, "-m", "venv", str(path)])

        def dispose(self):
            shutil.rmtree(str(self.path))

        def run_script(self, cmd: ty.List[str], working_directory: Path) -> ty.Tuple[str, str]:
            python_exe = self.path / "Scripts" / "python.exe"
            python = self.path / "bin" / "python"
            python_path = str(python) if python.exists() else str(python_exe)
            result = subprocess.run([python_path] + cmd, cwd=working_directory, stdout=subprocess.PIPE,
                                    stderr=subprocess.PIPE)
            return result.stdout.decode(), result.stderr.decode()

        def pip_install(self, path: Path):
            pip_exe = self.path / "Scripts" / "pip.exe"
            pip = self.path / "bin" / "pip"
            pip_path = str(pip) if pip.exists() else str(pip_exe)

            if path.suffix == ".whl":
                subprocess.run([pip_path, "install", str(path)])
            else:
                subprocess.run([pip_path, "install", "-r", str(path)])

        def install_dstack(self):
            wd = dp._working_directory()
            project_root = dp._find_project_root(wd)
            subprocess.run([sys.executable, "setup.py", "bdist_wheel"], cwd=project_root)
            wheel = project_root / "dist" / f"dstack-{dstack_version}-py3-none-any.whl"
            self.pip_install(wheel)

    def test_first_example(self):
        encoder = AppEncoder()

        def update(control: ctrl.TextField, text_field: ctrl.TextField):
            control.data = str(int(text_field.data) * 2)

        c1 = ctrl.TextField("10", id="c1")
        c2 = ctrl.TextField(id="c2", depends=c1, handler=update)

        my_app = app(test_app, x=c1, y=c2, requirements="tests/application/test_requirements.txt",
                     depends=["deprecation", "PyYAML==5.3.1", "tests.application.test_package"])

        frame_data = encoder.encode(my_app, None, None)

        function_settings = frame_data.settings["function"]
        self.assertEqual("source", function_settings["type"])
        self.assertEqual(test_app.__module__ + "." + test_app.__name__, function_settings["data"])

        base_dir = gettempdir() / Path("stage_simple")
        app_dir = self._save_data(frame_data, filename=base_dir / "application")

        env = self.Env(base_dir / "venv")
        env.install_dstack()
        env.pip_install(app_dir / "requirements.txt")

        test_script = f"""
        from tests.application.test_package.mymodule import test_app
        from inspect import signature
        
        # to be sure that all dependencies are installed
        import deprecation
        import yaml
        
        import cloudpickle

        with open("controller.pickle", "rb") as f:
            controller = cloudpickle.load(f)

        views = controller.list()
        controller.apply(test_app, views)
        """
        test_file = Path(app_dir) / "test_script.py"
        test_file.write_text(dedent(test_script).lstrip())
        output, error = env.run_script(["test_script.py"], app_dir)
        self.assertEqual("", error)
        self.assertEqual(f"Here is bar!{os.linesep}Here is foo!{os.linesep}My app: x=10 y=20{os.linesep}", output)
        env.dispose()
        shutil.rmtree(base_dir)

    def test_jupyter_like_env(self):
        def update(control, text_field):
            control.data = str(int(text_field.data) * 2)

        def baz():
            print("baz")

        c1 = ctrl.TextField("10", id="c1")
        c2 = ctrl.TextField(id="c2", depends=c1, handler=update)

        def my_func(x: ctrl.TextField, y: ctrl.TextField):
            foo()
            baz()
            return int(x.value()) + int(y.value())

        my_app = app(my_func, x=c1, y=c2, depends=["tests.application.test_package"])

        encoder = AppEncoder(force_serialization=True)
        frame_data = encoder.encode(my_app, None, None)

        function_settings = frame_data.settings["function"]
        self.assertEqual("pickle", function_settings["type"])

        base_dir = gettempdir() / Path("stage_jupyter_like")
        app_dir = self._save_data(frame_data, filename=base_dir / "application")

        env = self.Env(base_dir / "venv")
        env.install_dstack()

        pickled_function_path = Path(app_dir) / function_settings["data"]
        self.assertTrue(pickled_function_path.exists())

        test_script = f"""
        from inspect import signature
        import cloudpickle
    
        with open("controller.pickle", "rb") as f:
            controller = cloudpickle.load(f)

        with open("{pickled_function_path.name}", "rb") as f:
            func = cloudpickle.load(f)
            
        views = controller.list()
        controller.apply(func, views)
        """
        test_file = Path(app_dir) / "test_script.py"
        test_file.write_text(dedent(test_script).lstrip())

        output, error = env.run_script(["test_script.py"], app_dir)
        self.assertEqual("", error)
        self.assertEqual(f"Here is bar!{os.linesep}Here is foo!{os.linesep}baz{os.linesep}", output)
        env.dispose()

        shutil.rmtree(base_dir)

    @staticmethod
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
