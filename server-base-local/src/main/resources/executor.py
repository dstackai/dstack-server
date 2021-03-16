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

from expiringdict import ExpiringDict

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

encoder = AutoHandler()

cached_executions = ExpiringDict(max_len=30, max_age_seconds=60 * 5)


def find_cached_execution(previous_execution_id):
    return cached_executions.get(previous_execution_id)


def cache_execution(execution):
    previous_execution_id = execution.get("previous_execution_id")
    if previous_execution_id is not None:
        cached_executions.pop(previous_execution_id)
    cached_executions[execution["id"]] = execution


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


def execute(id, views, event, previous_execution_id):
    executions = Path(executions_home) / "finished"
    executions.mkdir(exist_ok=True)
    execution_file = executions / (id + '.json')
    if parse_version(dstack_version) >= parse_version("0.6.5.dev7"):
        logs_handler = StringIO()
        with redirect_stdout(logs_handler):
            _views = [v.pack() for v in (views or []) if not isinstance(v, ctrl.OutputView)]
            _outputs = []
            status = "FINISHED"
            try:
                def list_func():
                    return controller.list(views, event)

                views = handle_tqdm(id, list_func, token, server)
                _views = [v.pack() for v in views]
                for _view in _views:
                    if _view["type"] == "OutputView":
                        if _view["data"] is not None:
                            frame_data = encoder.encode(_view["data"], None, None)
                            _view["application"] = frame_data.application
                            _view["content_type"] = frame_data.content_type
                            _view["data"] = frame_data.data.base64value()
                        else:
                            if _view["data"] is None and _view["require_apply"] is True \
                                    and previous_execution_id is not None:
                                previous_execution = find_cached_execution(previous_execution_id)
                                if previous_execution is not None:
                                    previous_views = previous_execution.get("views") or []
                                    previous_view = list(filter(lambda v: v["id"] == _view["id"], previous_views))
                                    if len(previous_view) > 0:
                                        _view["application"] = previous_view[0].get("application")
                                        _view["content_type"] = previous_view[0].get("content_type")
                                        _view["data"] = previous_view[0].get("data")
                                        _view['outdated'] = True

            except Exception:
                status = 'FAILED'
                print(str(traceback.format_exc()))
        logs = logs_handler.getvalue()
    else:
        status = 'FAILED'
        logs = "Please update the client version of dstack and re-deploy the application: pip install dstack>=0.6.5"

    _containers = [_c.pack() for _c in controller.containers]
    execution = {"id": id, "status": status, "containers": _containers}
    if event is not None:
        execution["event"] = event.pack()
    if previous_execution_id is not None:
        execution["previous_execution_id"] = previous_execution_id
    if len(logs) > 0:
        execution["logs"] = logs
    if views is not None:
        execution["views"] = _views
    if hasattr(controller, "require_apply") and controller.require_apply:
        execution["require_apply"] = True
    execution_file.write_text(json.dumps(execution))
    cache_execution(execution)


def parse_command(command):
    command_json = json.loads(command)
    id = command_json.get("id")
    _views = command_json.get("views")
    views = [ctrl.unpack_view(v) for v in _views] if _views is not None else None
    _event = command_json.get("event")
    event = ctrl.unpack_event(_event) if _event else None
    previous_execution_id = command_json.get("previous_execution_id")
    return id, views, event, previous_execution_id


while True:
    command = sys.stdin.readline().strip()
    id, views, event, previous_execution_id = parse_command(command)
    # TODO: Support timeout in future
    execute(id, views, event, previous_execution_id)
