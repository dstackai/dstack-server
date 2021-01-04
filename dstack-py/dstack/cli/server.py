import subprocess
import sys
from argparse import Namespace

from dstack.cli.installer import Installer


def update(args: Namespace):
    installer = Installer(verify=not args.no_verify)
    if installer.update():
        print("Server is successfully updated")
    else:
        print("Server is up to date")


def start(args: Namespace):
    installer = Installer(verify=not args.no_verify)
    if not args.skip_update_check:
        installer.update()
    else:
        if installer.check_for_updates():
            print("Newer server version is available, type the following command to update: \n\tdstack server update\n")
    java = installer.find_jdk()
    jar = installer.jar_path()

    cmd = [java.path(), "-jar", jar]

    if args.port:
        cmd += ["--port", args.port]

    if args.home:
        cmd += ["--home", args.home]

    cmd += ["--python", args.python or sys.executable]

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
    start_parser.add_argument("--python", help="path to Python interpreter", type=str, nargs="?")
    start_parser.add_argument("--skip", help="skip checking for updates", dest="skip_update_check", action="store_true")
    start_parser.add_argument("--override", help="override the default config profile", action="store_true")

    add_no_verify(start_parser)
    start_parser.set_defaults(func=start)

    version_parser = subparsers.add_parser("version", help="print server version")
    version_parser.set_defaults(func=version)
