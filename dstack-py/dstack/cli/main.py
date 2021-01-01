import sys
from argparse import ArgumentParser

import dstack.cli.config as config
import dstack.cli.server as server
from dstack.version import __version__ as version


def main():
    parser = ArgumentParser(epilog="Please visit https://docs.dstack.ai for more information")
    parser.add_argument("--version", action="version", version=f"{version}")
    subparsers = parser.add_subparsers()

    config.register_parsers(subparsers)
    server.register_parsers(subparsers)

    if len(sys.argv) < 2:
        parser.print_help()
        exit(1)

    args = parser.parse_args()
    args.func(args)
