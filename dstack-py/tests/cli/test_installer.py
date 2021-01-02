import os
import platform
import shutil
import tempfile
from pathlib import Path
from typing import Optional
from uuid import uuid4

from dstack import push
from dstack.cli.installer import Installer, Java
from dstack.config import InPlaceConfig, Profile, configure, API_SERVER
from tests import TestBase


class TestInstaller(TestBase):
    def setUp(self):
        super().setUp()
        if os.getenv("JAVA_HOME"):
            del os.environ["JAVA_HOME"]
        self.temp = Path(tempfile.gettempdir()) / f"dstack-f{uuid4()}"
        self.temp.mkdir()
        self.installer_path = self.temp / ".dstack-installer"
        self.config = InPlaceConfig()
        self.config.add_or_replace_profile(
            Profile(Installer._PROFILE, Installer._USER, "fake_token", API_SERVER, verify=True))
        configure(self.config)

        self.installer = Installer(config=self.config, installer_path=self.installer_path, java_factory=self._java_factory)
        self.java_version = "1.8.0_221"

    def _java_factory(self, path: Path) -> Java:
        this = self

        class TestJava(Java):
            def __init__(self, java_home: Path):
                super().__init__(java_home)

            def version(self) -> str:
                return this.java_version

        return TestJava(path)

    def tearDown(self) -> None:
        shutil.rmtree(self.temp)
        super().tearDown()

    def test_install(self):
        jar_name = self.prepare_server_stack("0.1.0")

        # setup fake jdk to skip download
        self.fake_java()

        self.assertTrue(self.installer.install())

        file_to_check = self.installer_path / "lib" / jar_name
        self.assertTrue(file_to_check.exists())

    def fake_java(self, version: Optional[str] = None):
        (self.installer_path / "jdk").mkdir(parents=True)
        self.java_version = version or self.java_version

    def test_locate_java(self):
        self.assertIsNone(self.installer.find_jdk())

        java_home = self.installer_path / "my_java"
        java_home.mkdir(parents=True)
        os.environ["JAVA_HOME"] = str(java_home)
        jdk = self.installer.find_jdk()
        self.assertIsNotNone(jdk)
        self.assertEqual(java_home, jdk.java_home)

        jdk_dir = self.installer_path / "jdk"
        jdk_dir.mkdir(parents=True)
        jdk = self.installer.find_jdk()
        self.assertIsNotNone(jdk)
        self.assertEqual(jdk_dir, jdk.java_home)

    def test_update(self):
        self.config.set_property("server.version", "0.1.0")
        self.prepare_server_stack("0.1.0")
        self.fake_java()

        # server jar doesn't exist
        self.assertTrue(self.installer.check_for_updates())

        # try to check again to sure we updated nothing
        self.assertTrue(self.installer.update())

        # all things are up to date
        self.assertFalse(self.installer.check_for_updates())

        self.prepare_server_stack("0.1.2")
        self.assertTrue(self.installer.update())
        self.assertEqual("0.1.2", self.config.get_property("server.version"))

    def test_download_jdk(self):
        fake_jdk = self.create_fake_archive("OpenJDK-1.8.0.121-x86_64-bin")
        self.assertTrue(fake_jdk.exists())
        self.assertFalse(fake_jdk.is_dir())

        push(f"{Installer._JDK_STACK_BASE}/8", fake_jdk, profile=Installer._PROFILE, os=self.installer.get_os())

        self.installer._download_jdk("8")
        self.assertTrue(self.installer._jdk_path().exists())
        self.assertTrue(self.installer._jdk_path().is_dir())
        file_list = [p.name for p in self.installer._jdk_path().iterdir()]
        self.assertIn("file1.txt", file_list)

    def prepare_server_stack(self, version: str) -> str:
        jar_path = self.create_fake_file("fake-server.jar")
        push(Installer._STACK, jar_path, profile=Installer._PROFILE,
             version=version, jdk_version="8", jdk_compatible_versions=self.java_version)
        return jar_path.name

    def create_fake_file(self, filename: str) -> Path:
        fake_file = self.temp / filename

        with fake_file.open("wb") as f:
            f.write(b"hello world")

        return fake_file

    def create_fake_archive(self, filename: str) -> Path:
        archive = "zip" if platform.system() == "Windows" else "gztar"
        fake_file = self.temp / "in" / filename
        archive_file = self.temp / "out" / filename
        fake_file.mkdir(parents=True)

        for i in range(1, 10):
            self.create_fake_file(fake_file / f"file{i}.txt")

        return Path(shutil.make_archive(base_name=archive_file, format=archive, root_dir=fake_file.parent))
