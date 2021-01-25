import shutil
import subprocess
import sys
import typing as ty
from pathlib import Path

import dstack.application.dependencies as dp
from dstack.version import __version__ as dstack_version


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
