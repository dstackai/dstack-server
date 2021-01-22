import os
import shutil
import typing as ty
from pathlib import Path
from tempfile import gettempdir
from textwrap import dedent
from unittest import TestCase

import dstack.controls as ctrl
import dstack.util as util
from dstack import app
from dstack.application.handlers import AppEncoder
from dstack.handler import FrameData
from tests.application import Env
from tests.application.test_package.mymodule import test_app, foo


class TestApp(TestCase):
    def test_first_example(self):
        encoder = AppEncoder()

        def update(control: ctrl.TextField, text_field: ctrl.TextField):
            control.data = str(int(text_field.data) * 2)

        c1 = ctrl.TextField("10", id="c1")
        c2 = ctrl.TextField(id="c2", depends=c1, handler=update)
        o1 = ctrl.Output(test_app)

        # def my_test_app(x: ctrl.TextField, y: ctrl.TextField):
        #     foo()
        #     print(f"My local app: x={x.value()} y={y.value()}")

        my_app = app(controls=[c1, c2], outputs=[o1],
                     requirements="tests/application/test_requirements.txt",
                     depends=["deprecation", "PyYAML==5.3.1", "tests.application.test_package"])

        frame_data = encoder.encode(my_app, None, None)

        base_dir = gettempdir() / Path("stage_simple")
        app_dir = self._save_data(frame_data, filename=base_dir / "application")

        env = Env(base_dir / "venv")
        env.install_dstack()
        env.pip_install(app_dir / "requirements.txt")

        test_script = f"""
        from inspect import signature
        
        # to be sure that all dependencies are installed
        import deprecation
        import yaml
        
        import cloudpickle

        with open("controller.pickle", "rb") as f:
            controller = cloudpickle.load(f)

        views = controller.list()
        controller.apply(views)
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

        o1 = ctrl.Output(my_func)
        my_app = app(controls=[c1, c2], outputs=[o1], depends=["tests.application.test_package"])

        encoder = AppEncoder()
        frame_data = encoder.encode(my_app, None, None)

        base_dir = gettempdir() / Path("stage_jupyter_like")
        app_dir = self._save_data(frame_data, filename=base_dir / "application")

        env = Env(base_dir / "venv")
        env.install_dstack()

        test_script = f"""
        from inspect import signature
        import cloudpickle
    
        with open("controller.pickle", "rb") as f:
            controller = cloudpickle.load(f)

        views = controller.list()
        controller.apply(views)
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
