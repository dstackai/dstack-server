import os
import platform
import re
import shutil
import subprocess
from pathlib import Path
from tempfile import gettempdir
from typing import Optional, List, Callable
from uuid import uuid4

from dstack import pull_data, create_context
from dstack.config import Profile, from_yaml_file, API_SERVER, Config, _get_config_path, configure
from dstack.handler import FrameData
from packaging.version import parse as parse_version


class Java(object):
    def __init__(self, java_home: Path):
        self.java_home = java_home

    def path(self) -> str:
        return str(self.java_home / "bin" / self._java())

    def version(self) -> str:
        result = subprocess.run([self.path(), "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output = result.stderr.decode()
        java_version_str = output.splitlines()[0]
        m = re.match(f'.* version "(.*)"', java_version_str)
        return m.group(1)

    @staticmethod
    def _java():
        return "java.exe" if platform.system() == "Windows" else "java"


_JavaFactory = Callable[[Path], Java]


class Installer(object):
    _STACK = "artifacts/server"
    _JDK_STACK_BASE = "artifacts/jdk"
    _PROFILE = "dstack"

    def __init__(self, config: Config = None, base_path: Optional[Path] = None,
                 java_factory: Optional[_JavaFactory] = None, verify: bool = True):

        def my_java_factory(java_home: Path) -> Java:
            return Java(java_home)

        config_path = _get_config_path()

        self.base_path = base_path or config_path.parent
        self._conf = config or from_yaml_file(path=config_path)
        self._java_factory = java_factory if java_factory else my_java_factory
        self._verify = verify

        if not self._conf.get_profile("dstack"):
            profile = Profile(self._PROFILE, "dstack", None, API_SERVER, verify=verify)
            self._conf.add_or_replace_profile(profile)

        configure(self._conf)

    def _update(self, download: bool) -> bool:
        context = create_context(self._STACK, self._PROFILE)
        server_attachment = pull_data(context)
        server_version = server_attachment.params["version"]
        jdk_version = server_attachment.params["jdk_version"]
        jdk_compatible_versions = server_attachment.params["jdk_compatible_versions"].split(",")

        jar_file = self.jar_path()
        is_newer_version = self._is_newer_version(server_version) or not jar_file or not jar_file.exists()

        if is_newer_version and download:
            self._save_server(server_attachment)

        is_jdk_version_compatible = self._is_jdk_version_compatible(jdk_compatible_versions)

        if not is_jdk_version_compatible and download:
            self._download_jdk(jdk_version)

        return is_newer_version or not is_jdk_version_compatible

    def update(self) -> bool:
        return self._update(download=True)

    def check_for_updates(self) -> bool:
        return self._update(download=False)

    def install(self) -> bool:
        return self._update(download=True)

    def _is_newer_version(self, new_version: str) -> bool:
        current_version = self.version()

        if not current_version:
            return True

        return parse_version(new_version) > parse_version(current_version)

    def _is_jdk_version_compatible(self, compatible_versions: List[str]) -> bool:
        java = self.find_jdk()

        if not java:
            return False

        java_version = java.version()

        for version in compatible_versions:
            if re.match(version, java_version):
                return True

        return False

    def _save_server(self, data: FrameData):
        old_filename = self._conf.get_property("server.jar")
        lib_path = self.base_path / "lib"

        if old_filename:
            self._delete(lib_path / old_filename)

        new_filename = data.settings["filename"]
        path = lib_path / new_filename

        if not lib_path.exists():
            lib_path.mkdir(parents=True)

        self._download_data(data, path)

        self._conf.set_property("server.jar", str(path.name))
        self._conf.set_property("server.version", data.params["version"])
        self._conf.save()

    def jar_path(self, new_path: Optional[str] = None) -> Optional[Path]:
        server_jar = new_path or self._conf.get_property("server.jar")
        return self.base_path / "lib" / server_jar if server_jar else None

    def _download_jdk(self, version: str):
        context = create_context(f"{self._JDK_STACK_BASE}/{version}", self._PROFILE)
        jdk_attachment = pull_data(context, os=self.get_os())

        jdk_path = self._jdk_path(check_path_exist=False)

        if jdk_path.exists():
            self._delete(jdk_path)

        temp = Path(gettempdir()) / str(uuid4())

        archive_path = temp / jdk_attachment.settings["filename"]
        extract_dir = temp / "output"

        self._download_data(jdk_attachment, archive_path)

        shutil.unpack_archive(str(archive_path), extract_dir=str(extract_dir))

        list_files = list(extract_dir.iterdir())
        assert len(list_files) == 1

        self._move(list_files[0], jdk_path)
        self._delete(temp)

    def version(self) -> Optional[str]:
        return self._conf.get_property("server.version")

    def find_jdk(self) -> Optional[Java]:
        java_home = self._jdk_path() or self._java_home()

        if not java_home:
            return None

        return self._java_factory(java_home)

    @staticmethod
    def _download_data(data: FrameData, path: Path):
        # FIXME: user FileDecoder here
        if not path.parent.exists():
            path.parent.mkdir(parents=True)

        data.data.to_file(path, show_progress=True)

    def _jdk_path(self, check_path_exist: bool = True) -> Optional[Path]:
        path = self.base_path / "jdk"
        return path if not check_path_exist or path.exists() else None

    @staticmethod
    def _java_home() -> Optional[Path]:
        java_home = os.getenv("JAVA_HOME", None)
        return Path(java_home) if java_home and Path(java_home).exists() else None

    @staticmethod
    def _delete(path: Path):
        if path.is_dir():
            shutil.rmtree(str(path))
        elif path.exists():
            path.unlink()

    @staticmethod
    def get_os() -> str:
        return f"{platform.system()}-{platform.machine()}"

    @staticmethod
    def _move(src: Path, dst: Path):
        shutil.move(str(src), str(dst))
