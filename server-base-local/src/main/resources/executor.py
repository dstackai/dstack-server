import cloudpickle
import sys
import json
import traceback

from pathlib import Path
from importlib import import_module
from io import StringIO
from contextlib import redirect_stdout

from dstack.controls import unpack_view
from dstack import AutoHandler
from dstack.controls import Apply
from dstack import config as dstack_config
from dstack.config import InPlaceConfig, Profile

executions_home = sys.argv[1]
function_type = sys.argv[2]
function_data = sys.argv[3]
user = sys.argv[4]
token = sys.argv[5]
server = sys.argv[6]

in_place_config = InPlaceConfig()
in_place_config.add_or_replace_profile(Profile("default", user, token, server, verify=True))
dstack_config.configure(in_place_config)

# TODO: Handle errors and communicate it via a special app initialization log file
with open("controller.pickle", "rb") as f:
    controller = cloudpickle.load(f)

controller.init()

if function_type == "source":
    t = function_data.rsplit(".", -1)
    function_package = ".".join(t[:-1])
    function_name = t[-1]
    print(function_package)
    print(function_name)
    function_module = import_module(function_package)
    func = getattr(function_module, function_name)
else:
    with open(function_data, "rb") as f:
        func = cloudpickle.load(f)


def execute(id, views, apply):
    logs_handler = StringIO()
    with redirect_stdout(logs_handler):
        executions = Path(executions_home)
        executions.mkdir(exist_ok=True)
        running_executions = executions / "running"
        running_executions.mkdir(exist_ok=True)
        finished_executions = executions / "finished"
        finished_executions.mkdir(exist_ok=True)

        execution = {
            'id': id,
            'status': 'RUNNING' if apply else 'READY'
        }

        try:
            views = controller.list(views)
            execution['views'] = [v.pack() for v in views]
            executions = running_executions if apply else finished_executions
            execution['logs'] = logs_handler.getvalue()
            execution_file = executions / (id + '.json')
            execution_file.write_text(json.dumps(execution))

            if apply:
                result = controller.apply(func, views)
                execution['status'] = 'FINISHED'
                output = {}
                encoder = AutoHandler()
                frame_data = encoder.encode(result, None, None)
                output['application'] = frame_data.application
                output['content_type'] = frame_data.content_type
                output['data'] = frame_data.data.base64value()
                execution['output'] = output
        except Exception:
            execution['status'] = 'FAILED'
            print(str(traceback.format_exc()))

    if apply:
        if 'views' not in execution:
            execution['views'] = [v.pack() for v in views]
        execution['logs'] = logs_handler.getvalue()
        finished_execution_file = finished_executions / (id + '.json')
        finished_execution_file.write_text(json.dumps(execution))


def parse_command(command):
    command_json = json.loads(command)
    id = command_json.get("id")
    _views = command_json.get("views")
    views = [unpack_view(v) for v in _views] if _views is not None else None
    apply = command_json.get("apply")
    return id, views, apply


while True:
    command = sys.stdin.readline().strip()
    id, views, apply = parse_command(command)
    # TODO: Support timeout in future
    execute(id, views, apply)
