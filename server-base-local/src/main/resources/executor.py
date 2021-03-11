import cloudpickle
import sys
import json
import traceback
import requests

from pathlib import Path
from importlib import import_module
from io import StringIO
from contextlib import redirect_stdout

import dstack.controls as ctrl
from dstack import AutoHandler
from dstack import config as dstack_config
from dstack.config import InPlaceConfig, Profile
from dstack.version import __version__ as dstack_version
from packaging.version import parse as parse_version
from dstack.tqdm import tqdm, TqdmHandler, set_tqdm_handler

# TODO: Refactor qnd cover this functionality with tests

from queue import Queue, Empty
from threading import Thread

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

update_in_progress = False
updates_queue = Queue()


def handle_tqdm(id, func, token, server):
    global update_in_progress
    update_in_progress = True

    def update_execution():
        while update_in_progress:
            try:
                payload = updates_queue.get(timeout=1)
                requests.post(server + "/apps/update", headers={"Authorization": "Bearer " + token}, json=payload)
            except Empty:
                pass

    update_thread = Thread(target=update_execution, args=[])
    update_thread.start()

    class Handler(TqdmHandler):
        def close(self, tqdm: tqdm):
            with updates_queue.mutex:
                updates_queue.queue.clear()
            updates_queue.put({"id": id, "tqdm": {"desc": tqdm.desc, "n": tqdm.n, "total": tqdm.total,
                                                  "elapsed": tqdm.format_dict["elapsed"]}})

        def display(self, tqdm: tqdm):
            with updates_queue.mutex:
                updates_queue.queue.clear()
            updates_queue.put({"id": id, "tqdm": {"desc": tqdm.desc, "n": tqdm.n, "total": tqdm.total,
                                                  "elapsed": tqdm.format_dict["elapsed"]}})

    set_tqdm_handler(Handler())

    result = func()

    update_in_progress = False

    set_tqdm_handler(None)

    return result


def execute(id, views, event):
    executions = Path(executions_home) / "finished"
    executions.mkdir(exist_ok=True)
    execution_file = executions / (id + '.json')
    if parse_version(dstack_version) >= parse_version("0.6.3.dev6"):
        logs_handler = StringIO()
        with redirect_stdout(logs_handler):
            _views = [v.pack() for v in (views or []) if not isinstance(v, ctrl.OutputView)]
            _outputs = []
            status = "FINISHED"
            try:
                apply = event is not None and event.get("type") == "apply"

                def list_func():
                    return controller.list(views, apply)

                views = handle_tqdm(id, list_func, token, server)
                _views = [v.pack() for v in views]
                for _view in _views:
                    if _view["type"] == "OutputView" and _view["data"] is not None:
                        encoder = AutoHandler()
                        frame_data = encoder.encode(_view["data"], None, None)
                        _view["application"] = frame_data.application
                        _view["content_type"] = frame_data.content_type
                        _view["data"] = frame_data.data.base64value()
            except Exception:
                status = 'FAILED'
                print(str(traceback.format_exc()))
        logs = logs_handler.getvalue()
    else:
        status = 'FAILED'
        logs = "Please update the client version of dstack and re-deploy the application: pip install dstack>=0.6.3"

    _containers = [_c.pack() for _c in controller.containers]
    execution = {"id": id, "status": status, "containers": _containers, "event": event}
    if len(logs) > 0:
        execution["logs"] = logs
    if views is not None:
        execution["views"] = _views
    if hasattr(controller, "require_apply") and controller.require_apply:
        execution["require_apply"] = True
    execution_file.write_text(json.dumps(execution))


def parse_command(command):
    command_json = json.loads(command)
    id = command_json.get("id")
    _views = command_json.get("views")
    views = [ctrl.unpack_view(v) for v in _views] if _views is not None else None
    event = command_json.get("event")
    return id, views, event


while True:
    command = sys.stdin.readline().strip()
    id, views, event = parse_command(command)
    # TODO: Support timeout in future
    execute(id, views, event)
