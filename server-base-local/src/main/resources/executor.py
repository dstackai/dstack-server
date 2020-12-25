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

executions_home = sys.argv[1]
function_type = sys.argv[2]
function_data = sys.argv[3]

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


def apply(views, execution_id, stack_path, logs_handler):
    with redirect_stdout(logs_handler):
        executions = Path(executions_home)
        executions.mkdir(exist_ok=True)
        execution_file = executions / (execution_id + '.json')

        execution = {
            'stack': stack_path,
            'id': execution_id,
            'status': 'RUNNING' if apply else 'READY'
        }

        try:
            has_dependant = False
            has_apply = False
            for c in controller.controls_by_id.values():
                if isinstance(c, Apply):
                    has_apply = True
                if c.is_dependent():
                    has_dependant = True
            if has_dependant and not has_apply:
                views = controller.list(views)
                execution['views'] = [v.pack() for v in views]
                execution_file.write_text(json.dumps(execution))

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

    if 'views' not in execution:
        execution['views'] = [v.pack() for v in views]
    execution['logs'] = logs_handler.getvalue()
    execution_file.write_text(json.dumps(execution))


def update(views):
    with redirect_stdout(logs_handler):
        try:
            updated_views = controller.list(views)
            status = 'READY'
        except Exception:
            updated_views = views
            status = 'FAILED'
            print(str(traceback.format_exc()))
    print_views_stdout(updated_views, logs_handler, status)


def parse_command(command):
    command_json = json.loads(command)
    _views = command_json.get("views")
    execution_id = command_json.get("id")
    views = [unpack_view(v) for v in _views] if _views else None
    stack_path = command_json.get("stack")
    return views, execution_id, stack_path


def print_views_stdout(views, logs_handler, status):
    execution = {
        'status': status,
        'views': [v.pack() for v in (views or [])],
        'logs': logs_handler.getvalue()
    }
    sys.stdout.write(json.dumps(execution, indent=None, separators=(",", ":")) + "\n")
    sys.stdout.flush()


while True:
    # TODO: Support timeout in future
    command = sys.stdin.readline()
    views, execution_id, stack_path = parse_command(command)
    logs_handler = StringIO()
    if views and execution_id and stack_path:
        apply(views, execution_id, stack_path, logs_handler)
    else:
        # TODO: Make it possible to transport the views state without transporting the entire data
        update(views)
