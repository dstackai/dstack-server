import re
import subprocess
import sys
from argparse import Namespace
from pathlib import Path

from dstack.cli.installer import Installer


def update(args: Namespace):
    installer = Installer(verify=not args.no_verify)
    if installer.update():
        print("Server is successfully updated")
    else:
        print("Server is up to date")


def python_executables(args):
    python_executables = []

    if args.python:
        for p in args.python:
            executable = p[0]
            if Path(executable).exists():
                python_major_version = subprocess.run(
                    [executable, "-c", "import sys; print(\".\".join(map(str,sys.version_info[:2])))"],
                    stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout.decode().rstrip()
                if re.match("^\d\.\d$", python_major_version):
                    python_executables.append(python_major_version + "=" + executable)
                else:
                    print("Python executable is not properly configured: " + executable)
                    return None
            else:
                print("Python executable is not found: " + executable)
                return None
    else:
        python_executables.append(".".join(map(str, sys.version_info[:2])) + "=" + sys.executable)
    return ';'.join(python_executables)


def start(args: Namespace):
    installer = Installer(verify=not args.no_verify)
    if not args.skip_update_check:
        installer.update()
    else:
        if installer.check_for_updates():
            print("Newer server version is available, type the following command to update: \n\tdstack server update\n")
    java = installer.find_jdk()
    jar = installer.jar_path()

    java.make_executable()
    cmd = [java.path(), "-jar", jar]

    if args.port:
        cmd += ["--port", args.port]

    if args.home:
        cmd += ["--home", args.home]

    executables = python_executables(args)
    if not executables:
        return

    cmd += ["--python", executables]

    if args.override:
        cmd += ["--override"]

    try:
        subprocess.run([str(x) for x in cmd])
    except KeyboardInterrupt:
        print("Server stopped")


def version(args: Namespace):
    installer = Installer()
    print(installer.version() or "Server is not installed")


def register_parsers(main_subparsers):
    def add_no_verify(command_parser):
        command_parser.add_argument("--no-verify", help="do not verify SSL certificates", dest="no_verify",
                                    action="store_true")

    parser = main_subparsers.add_parser("server", help="manage your dstack server")

    subparsers = parser.add_subparsers()
    update_parser = subparsers.add_parser("update", help="update server")
    add_no_verify(update_parser)
    update_parser.set_defaults(func=update)

    start_parser = subparsers.add_parser("start", help="start server")
    start_parser.add_argument("--port", help="use specific port", type=int, nargs="?")
    start_parser.add_argument("--home", help="store server data in the specified directory", type=str, nargs="?")
    start_parser.add_argument("--python", help="path to the python executable", action="append", nargs="*")
    start_parser.add_argument("--skip", help="skip checking for updates", dest="skip_update_check", action="store_true")
    start_parser.add_argument("--override", help="override the default config profile", action="store_true")

    add_no_verify(start_parser)
    start_parser.set_defaults(func=start)

    version_parser = subparsers.add_parser("version", help="print server version")
    version_parser.set_defaults(func=version)
