from argparse import Namespace
from pathlib import Path

from dstack.cli import confirm, get_or_ask
from dstack.config import API_SERVER, from_yaml_file, _get_config_path, Profile
from dstack.logger import hide_token


def list_profiles(args: Namespace):
    conf = from_yaml_file(_get_config_path(args.file))
    print("list of available profiles:\n")
    profiles = conf.list_profiles()
    for name in profiles:
        profile = profiles[name]
        print(name)
        print(f"\tUser: {profile.user}")
        print(f"\tToken: {hide_token(profile.token)}")
        if profile.server != API_SERVER:
            print(f"\tServer: {profile.server}")


def remove_profile(args: Namespace):
    conf = from_yaml_file(_get_config_path(args.file))

    if args.force or confirm(f"Do you want to delete profile '{args.profile}'"):
        conf.remove_profile(args.profile)

    conf.save()


def add_or_modify_profile(args: Namespace):
    file = Path(args.file) if args.file else None
    conf = from_yaml_file(_get_config_path(file))
    profile = conf.get_profile(args.profile)

    user = get_or_ask(args, profile, "user", "User: ", secure=False)
    token = get_or_ask(args, profile, "token", "Token: ", secure=True)

    if profile is None:
        profile = Profile(args.profile, user, token, args.server, not args.no_verify)
    elif args.force or (token != profile.token and confirm(
            f"Do you want to replace token for profile '{args.profile}'")):
        profile.token = token

    profile.server = args.server
    profile.user = user
    profile.verify = not args.no_verify

    conf.add_or_replace_profile(profile)
    conf.save()


def register_parsers(main_subparsers):
    def add_common_arguments(command_parser):
        add_profile_argument(command_parser)
        command_parser.add_argument("--token", help="set token for selected profile", type=str, nargs="?")
        command_parser.add_argument("--server", help="set server to handle api requests", type=str, nargs="?",
                                    default=API_SERVER, const=API_SERVER)
        command_parser.add_argument("--user", help="set user name", type=str, nargs="?")
        command_parser.add_argument("--no-verify", help="do not verify SSL certificates", dest="no_verify",
                                    action="store_true")

    def add_force_argument(command_parser):
        command_parser.add_argument("--force", help="don't ask for confirmation", action="store_true")

    def add_file_argument(command_parser):
        command_parser.add_argument("--file", help="use specific config file")

    def add_profile_argument(command_parser):
        command_parser.add_argument("profile", metavar="PROFILE", help="profile name, 'default' if missing", type=str,
                                    default="default", nargs="?")


    parser = main_subparsers.add_parser("config", help="manage your configuration")
    subparsers = parser.add_subparsers()

    add_parser = subparsers.add_parser("add", help="create a new profile")
    add_common_arguments(add_parser)
    add_force_argument(add_parser)
    add_file_argument(add_parser)
    add_parser.set_defaults(func=add_or_modify_profile)

    modify_parser = subparsers.add_parser("modify", help="modify existing profile")
    add_common_arguments(modify_parser)
    add_force_argument(modify_parser)
    add_file_argument(modify_parser)
    modify_parser.set_defaults(func=add_or_modify_profile)

    remove_parser = subparsers.add_parser("remove", help="remove existing profile")
    add_profile_argument(remove_parser)
    add_force_argument(remove_parser)
    add_file_argument(remove_parser)
    remove_parser.set_defaults(func=remove_profile)

    list_parser = subparsers.add_parser("list", help="list configured profiles")
    add_file_argument(list_parser)
    list_parser.set_defaults(func=list_profiles)
