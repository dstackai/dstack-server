from dstack import frame
from dstack.cli.installer import Installer
from pathlib import Path

if __name__ == '__main__':
    frame = frame(Installer._JDK_STACK_BASE + "/8")
    frame.add(Path("jdk/8/bellsoft-jre8u282+8-macos-amd64.zip"), os="Darwin-x86_64")
    frame.add(Path("jdk/8/bellsoft-jre8u282+8-linux-amd64.tar.gz"), os="Linux-x86_64")
    frame.add(Path("jdk/8/bellsoft-jre8u282+8-windows-amd64.zip"), os="Windows-AMD64")
    print(frame.push())
