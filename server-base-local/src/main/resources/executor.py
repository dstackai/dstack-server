import cloudpickle
import sys
import json
import traceback

from pathlib import Path
from importlib import import_module
from io import StringIO
from contextlib import redirect_stdout

from atomicwrites import atomic_write

import dstack.controls as ctrl
from dstack import AutoHandler
from dstack import config as dstack_config
from dstack.config import InPlaceConfig, Profile
from dstack.version import __version__ as dstack_version
from dstack.tqdm import tqdm, TqdmHandler, set_tqdm_handler

# TODO: Refactor qnd cover this functionality with tests

executions_home = sys.argv[1]

user = sys.argv[2]
token = sys.argv[3]
server = sys.argv[4]
if len(sys.argv) > 5:
    function_type = sys.argv[5]
    function_data = sys.argv[6]
else:
    function_type = None
    function_data = None

in_place_config = InPlaceConfig()
in_place_config.add_or_replace_profile(Profile("default", user, token, server, verify=True))
dstack_config.configure(in_place_config)

# TODO: Handle errors and communicate it via a special app initialization log file
with open("controller.pickle", "rb") as f:
    controller = cloudpickle.load(f)

controller.init()

if function_type and function_data:
    if function_type == "source":
        t = function_data.rsplit(".", -1)
        function_package = ".".join(t[:-1])
        function_name = t[-1]
        function_module = import_module(function_package)
        func = getattr(function_module, function_name)
    else:
        with open(function_data, "rb") as f:
            func = cloudpickle.load(f)
else:
    func = None


def handle_tqdm(execution, execution_file, func):
    class Handler(TqdmHandler):
        def close(self, tqdm: tqdm):
            execution["tqdm"] = {"desc": tqdm.desc, "n": tqdm.n, "total": tqdm.total,
                                 "elapsed": tqdm.format_dict["elapsed"]}
            with atomic_write(execution_file.absolute(), overwrite=True) as f:
                f.write(json.dumps(execution))

        def display(self, tqdm: tqdm):
            execution["tqdm"] = {"desc": tqdm.desc, "n": tqdm.n, "total": tqdm.total,
                                 "elapsed": tqdm.format_dict["elapsed"]}
            # TODO: Make sure it's not very expensive operation.
            #   Otherwise: use a separate file
            with atomic_write(execution_file.absolute(), overwrite=True) as f:
                f.write(json.dumps(execution))

    set_tqdm_handler(Handler())

    result = func()

    set_tqdm_handler(None)

    return result


def execute(id, views, apply):
    logs_handler = StringIO()
    with redirect_stdout(logs_handler):
        executions = Path(executions_home)
        executions.mkdir(exist_ok=True)
        execution_file = executions / (id + '.json')

        execution = {
            'id': id,
            'status': 'RUNNING' if apply else 'SCHEDULED'
        }

        try:
            def list_func():
                return controller.list(views)

            views = handle_tqdm(execution, execution_file, list_func)

            if not apply:
                execution["status"] = "READY"
            execution['views'] = [v.pack() for v in views]
            execution['logs'] = logs_handler.getvalue()
            with atomic_write(execution_file.absolute(), overwrite=True) as f:
                f.write(json.dumps(execution))

            if apply:
                def apply_func():
                    if dstack_version.startswith("0.6.dev") or dstack_version.startswith("0.6.0"):
                        if func:
                            output = ctrl.Output()
                            output.data = controller.apply(func, views)
                            return [output]
                        else:
                            raise ValueError("The client doesn't support this format of the application. "
                                             "Please make sure to update the client to 0.6.1 or higher.")
                    else:
                        if func:
                            def handler(o, *args):
                                o.data = func(*args)

                            controller._outputs = [ctrl.Output(handler=handler)]
                        return controller.apply(views)

                outputs = handle_tqdm(execution, execution_file, apply_func)
                execution["status"] = "FINISHED"
                encoder = AutoHandler()
                execution_outputs = []
                for o in outputs:
                    frame_data = encoder.encode(o.data, None, None)
                    output = {"id": o._id,
                              "application": frame_data.application,
                              "content_type": frame_data.content_type,
                              "data": frame_data.data.base64value()}
                    if o.label:
                        output["label"] = o.label
                    execution_outputs.append(output)
                execution["outputs"] = execution_outputs
        except Exception:
            execution["status"] = 'FAILED'
            print(str(traceback.format_exc()))

    if apply:
        if 'views' not in execution:
            execution['views'] = [v.pack() for v in views]
        execution['logs'] = logs_handler.getvalue()
        with atomic_write(execution_file.absolute(), overwrite=True) as f:
            f.write(json.dumps(execution))


def parse_command(command):
    command_json = json.loads(command)
    id = command_json.get("id")
    _views = command_json.get("views")
    views = [ctrl.unpack_view(v) for v in _views] if _views is not None else None
    apply = command_json.get("apply")
    return id, views, apply


while True:
    command = sys.stdin.readline().strip()
    id, views, apply = parse_command(command)
    # TODO: Support timeout in future
    execute(id, views, apply)
