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

        def update(control: ctrl.Input, text_field: ctrl.Input):
            control.text = str(int(text_field.text) * 2)

        my_app = app(requirements="tests/application/test_requirements.txt",
                     depends=["deprecation", "PyYAML==5.3.1", "tests.application.test_package"])

        c1 = my_app.input(text="10")
        c2 = my_app.input(handler=update, depends=c1)
        _ = my_app.output(handler=test_app, depends=[c1, c2])

        # def my_test_app(x: ctrl.TextField, y: ctrl.TextField):
        #     foo()
        #     print(f"My local app: x={x.value()} y={y.value()}")

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
        print(views[2].data)
        """
        test_file = Path(app_dir) / "test_script.py"
        test_file.write_text(dedent(test_script).lstrip())
        output, error = env.run_script(["test_script.py"], app_dir)
        self.assertEqual("", error)
        self.assertEqual(f"Here is bar!{os.linesep}Here is foo!{os.linesep}My app: x=10 y=20{os.linesep}30{os.linesep}",
                         output)
        env.dispose()
        shutil.rmtree(base_dir)

    def test_jupyter_like_env(self):
        def update(control, text_field):
            control.text = str(int(text_field.text) * 2)

        def baz():
            print("baz")

        my_app = app(depends=["tests.application.test_package"])

        _ = my_app.input(text="0")
        c1 = my_app.input(text="10")
        c2 = my_app.input(handler=update, depends=c1)

        def output_handler(self: ctrl.Output, x: ctrl.Input, y: ctrl.Input):
            foo()
            baz()
            self.data = int(x.text) + int(y.text)

        _ = my_app.output(handler=output_handler, depends=[c1, c2])

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
        print(views[3].data)
        """
        test_file = Path(app_dir) / "test_script.py"
        test_file.write_text(dedent(test_script).lstrip())

        output, error = env.run_script(["test_script.py"], app_dir)
        self.assertEqual("", error)
        self.assertEqual(f"Here is bar!{os.linesep}Here is foo!{os.linesep}baz{os.linesep}30{os.linesep}", output)
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
