import time
import typing as ty
from unittest import TestCase
from datetime import date

from dstack import md
from dstack.tqdm import tqdm, set_tqdm_handler

import dstack.controls as ctrl
from dstack.controls import Controller, ApplyView

from dstack.tqdm import trange, TqdmHandler


class TestControls(TestCase):
    @staticmethod
    def get_by_id(id: str, views: ty.List[ctrl.View]) -> ty.Optional[ctrl.View]:
        for view in views:
            if view.id == id:
                return view

        return None

    @staticmethod
    def get_apply(views: ty.List[ctrl.View]) -> ty.Optional[ctrl.View]:
        for view in views:
            if isinstance(view, ApplyView):
                return view

        return None

    def test_simple_check_box(self):
        c1 = ctrl.Checkbox()
        controller = Controller([c1])
        views = controller.list()
        v1 = ty.cast(ctrl.CheckboxView, self.get_by_id(c1.get_id(), views))
        self.assertEqual(False, v1.selected)

    def test_callable_check_box(self):
        def get_selected():
            return True

        c1 = ctrl.Checkbox(selected=get_selected)
        controller = Controller([c1])
        views = controller.list()
        v1 = ty.cast(ctrl.CheckboxView, self.get_by_id(c1.get_id(), views))
        self.assertEqual(True, v1.selected)

    def test_dependant_check_box(self):
        def get_selected(self: ctrl.Checkbox, c2: ctrl.Input):
            self.selected = int(c2.value()) > 5

        c1 = ctrl.Input("10")
        c2 = ctrl.Checkbox(handler=get_selected, depends=[c1])
        controller = Controller([c1, c2])
        views = controller.list()
        v1 = ty.cast(ctrl.InputView, self.get_by_id(c1.get_id(), views))
        v2 = ty.cast(ctrl.CheckboxView, self.get_by_id(c2.get_id(), views))
        self.assertEqual("10", v1.text)
        self.assertEqual(True, v2.selected)
        v1.text = "5"
        views = controller.list(views)
        v1 = ty.cast(ctrl.InputView, self.get_by_id(c1.get_id(), views))
        v2 = ty.cast(ctrl.CheckboxView, self.get_by_id(c2.get_id(), views))
        self.assertEqual("5", v1.text)
        self.assertEqual(False, v2.selected)

    def test_simple_update(self):
        def update(control: ctrl.Control, text_field: ctrl.Input):
            control.text = str(int(text_field.text) * 2)

        c1 = ctrl.Input("10")
        c2 = ctrl.Input(depends=c1, handler=update, long=True)
        controller = Controller([c1, c2])
        views = controller.list()
        self.assertEqual(3, len(views))  # Apply will appear here
        ids = [v.id for v in views]
        self.assertIn(c1.get_id(), ids)
        self.assertIn(c2.get_id(), ids)

        v1 = self.get_by_id(c1.get_id(), views)
        v2 = self.get_by_id(c2.get_id(), views)

        if isinstance(v1, ctrl.InputView):
            self.assertEqual("10", v1.text)
            self.assertIsNone(v1.long)
        else:
            self.fail()

        if isinstance(v2, ctrl.InputView):
            self.assertEqual("20", v2.text)
            self.assertIsNotNone(v2.long)
        else:
            self.fail()

        views = controller.list(views)
        v1 = self.get_by_id(c1.get_id(), views)
        v2 = self.get_by_id(c2.get_id(), views)

        if isinstance(v1, ctrl.InputView):
            self.assertEqual("10", v1.text)
            self.assertIsNone(v1.long)
        else:
            self.fail()

        if isinstance(v2, ctrl.InputView):
            self.assertEqual("20", v2.text)
            self.assertIsNotNone(v2.long)

    def test_update_error(self):
        def update(control: ctrl.Control, text_area: ctrl.Input):
            raise ValueError()

        c1 = ctrl.Input("10")
        c2 = ctrl.Input(depends=c1, handler=update)

        controller = Controller([c1, c2])

        try:
            controller.list(controller.list())
            self.fail()
        except ctrl.UpdateError as e:
            self.assertEqual(c2.get_id(), e.id)

    def test_handler_called_only_once(self):
        count = 0

        def update_c2(control: ctrl.Control, text_area: ctrl.Input):
            nonlocal count
            if count == 0:
                count += 1
            else:
                print(count)
                raise RuntimeError()

            control.text = str(int(text_area.text) * 2)

        def update_c3_c4(control: ctrl.Control, text_area: ctrl.Input):
            control.text = str(int(text_area.text) * 2)

        c1 = ctrl.Input("10")
        c2 = ctrl.Input(depends=c1, handler=update_c2)
        c3 = ctrl.Input(depends=c2, handler=update_c3_c4)
        c4 = ctrl.Input(depends=c2, handler=update_c3_c4)

        controller = Controller([c1, c2, c3, c4])
        views = controller.list()
        self.assertEqual(1, count)
        v2 = ty.cast(ctrl.InputView, self.get_by_id(c2.get_id(), views))
        v3 = ty.cast(ctrl.InputView, self.get_by_id(c3.get_id(), views))
        v4 = ty.cast(ctrl.InputView, self.get_by_id(c4.get_id(), views))

        self.assertEqual("20", v2.text)
        self.assertEqual("40", v3.text)
        self.assertEqual("40", v4.text)

    def test_file_uploader(self):
        file_uploader = ctrl.Uploader()
        self.assertTrue(isinstance(file_uploader.uploads, list))

        controller = Controller([file_uploader])
        views = controller.list()
        file_uploader_view = ty.cast(ctrl.UploaderView, self.get_by_id(file_uploader.get_id(), views))
        self.assertTrue(isinstance(file_uploader_view.uploads, list))
        self.assertEqual({"uploads": []}, file_uploader_view._pack())
        today = date.today()
        file_uploader_view.uploads.append(ctrl.Upload("some_file_id", "some_file_name", 123, today))
        packed_view = {"id": file_uploader._id, "enabled": True, "label": None, "optional": False,
                       "type": "UploaderView", "uploads": [
                {"id": "some_file_id", "file_name": "some_file_name", "length": 123,
                 "created_date": today.strftime("%Y-%m-%d")}]}
        self.assertEqual(packed_view,
                         file_uploader_view.pack())
        file_uploader.apply(file_uploader_view)
        value = file_uploader.value()
        self.assertTrue(isinstance(value, list))
        self.assertEqual(len(value), 1)
        self.assertEqual(value[0].id, "some_file_id")
        self.assertEqual(value[0].file_name, "some_file_name")
        self.assertEqual(value[0].length, 123)
        self.assertEqual(value[0].created_date, today)
        unpacked_view = ctrl.unpack_view(packed_view)
        self.assertTrue(isinstance(unpacked_view, ctrl.UploaderView))
        self.assertTrue(isinstance(unpacked_view.uploads, list))
        self.assertEqual(len(unpacked_view.uploads), 1)
        unpacked_upload = unpacked_view.uploads[0]
        self.assertEqual(unpacked_upload.id, "some_file_id")
        self.assertEqual(unpacked_upload.file_name, "some_file_name")
        self.assertEqual(unpacked_upload.length, 123)
        self.assertEqual(unpacked_upload.created_date, today)

    def test_combo_box(self):
        def update(control: ctrl.Select, parent: ctrl.Select):
            selected = parent.items[parent.selected]
            control.items = [f"{selected} 1", f"{selected} 2"]

        cb = ctrl.Select(["Hello", "World"])
        self.assertTrue(isinstance(cb._derive_model(), ctrl.DefaultListModel))

        c1 = ctrl.Select(handler=update, depends=cb)
        controller = Controller([c1, cb])
        views = controller.list()
        v = ty.cast(ctrl.SelectView, self.get_by_id(cb.get_id(), views))
        v1 = ty.cast(ctrl.SelectView, self.get_by_id(c1.get_id(), views))

        self.assertEqual(0, v.selected)
        self.assertEqual(["Hello 1", "Hello 2"], v1.titles)

        v.selected = 1
        print(views)
        views = controller.list(views)
        print(views)
        v = ty.cast(ctrl.SelectView, self.get_by_id(cb.get_id(), views))
        v1 = ty.cast(ctrl.SelectView, self.get_by_id(c1.get_id(), views))

        self.assertEqual(1, v.selected)
        self.assertEqual(["World 1", "World 2"], v1.titles)

    def test_markdown(self):
        m1 = ctrl.Markdown(text="Hello, **this** is Markdown")
        controller = Controller([m1])
        views = controller.list()
        self.assertTrue(isinstance(views[0].data, md.Markdown))
        self.assertEquals("Hello, **this** is Markdown", views[0].data.text)

        m2 = ctrl.Markdown(text=lambda: "Hello, **this** is Markdown")
        controller = Controller([m2])
        views = controller.list()
        self.assertTrue(isinstance(views[0].data, md.Markdown))
        self.assertEquals("Hello, **this** is Markdown", views[0].data.text)

        t1 = ctrl.Input("Markdown")

        def m_handler(self: ctrl.Markdown, t1: ctrl.Input):
            self.text = "Hello, **this** is " + t1.text

        m3 = ctrl.Markdown(handler=m_handler, depends=[t1])
        controller = Controller([t1, m3])
        views = controller.list(apply=True)
        self.assertTrue(isinstance(views[1].data, md.Markdown))
        self.assertEquals("Hello, **this** is Markdown", views[1].data.text)

    def test_multiple_combo_box(self):
        def update(control: ctrl.Select, parent: ctrl.Select):
            selected = [parent.items[s] for s in parent.selected]
            control.items = [f"{selected} 1", f"{selected} 2"]

        cb = ctrl.Select(["Hello", "World"], multiple=True)
        self.assertTrue(isinstance(cb._derive_model(), ctrl.DefaultListModel))

        c1 = ctrl.Select(handler=update, depends=cb)
        controller = Controller([c1, cb])
        views = controller.list()
        v = ty.cast(ctrl.SelectView, self.get_by_id(cb.get_id(), views))
        v1 = ty.cast(ctrl.SelectView, self.get_by_id(c1.get_id(), views))

        self.assertEqual([], v.selected)
        self.assertEqual(["[] 1", "[] 2"], v1.titles)

        v.selected = [1]
        print(views)
        views = controller.list(views)
        print(views)
        v = ty.cast(ctrl.SelectView, self.get_by_id(cb.get_id(), views))
        v1 = ty.cast(ctrl.SelectView, self.get_by_id(c1.get_id(), views))

        self.assertEqual([1], v.selected)
        self.assertEqual(["['World'] 1", "['World'] 2"], v1.titles)

        v.selected = [0, 1]
        print(views)
        views = controller.list(views)
        print(views)
        v = ty.cast(ctrl.SelectView, self.get_by_id(cb.get_id(), views))
        v1 = ty.cast(ctrl.SelectView, self.get_by_id(c1.get_id(), views))

        self.assertEqual([0, 1], v.selected)
        self.assertEqual(["['Hello', 'World'] 1", "['Hello', 'World'] 2"], v1.titles)

    def test_immutability_of_controller(self):
        text_field = ctrl.Input(text="Some initial data")
        controller = Controller([text_field])
        views = controller.list()
        self.assertEqual(views[0].text, "Some initial data")
        views[0].text = "Some other data"
        updated_views = controller.list(views)
        self.assertEqual(updated_views[0].text, "Some other data")
        views = controller.list()
        self.assertEqual(views[0].text, "Some initial data")

    def test_combo_box_callable_model(self):
        class City:
            def __init__(self, id, title):
                self.id = id
                self.title = title

            def __repr__(self):
                return self.title

        class Country:
            def __init__(self, code, title):
                self.code = code
                self.title = title

            def __repr__(self):
                return self.title

        data = {"US": [City(0, "New York"), City(1, "San Francisco"), City(2, "Boston")],
                "DE": [City(10, "Munich"), City(11, "Berlin"), City(12, "Hamburg")]}

        def list_cities_from_db_by_code(country: Country) -> ty.List[City]:
            return data[country.code]

        def list_countries_from_db() -> ty.List[Country]:
            return [Country("US", "United States"), Country("DE", "German")]

        def update_cities(control: ctrl.Select, parent: ctrl.Select):
            country = ty.cast(Country, parent.get_model().element(parent.selected))
            control.items = list_cities_from_db_by_code(country)

        countries = ctrl.Select(list_countries_from_db)
        self.assertTrue(isinstance(countries._derive_model(), ctrl.CallableListModel))

        cities = ctrl.Select(handler=update_cities, depends=countries)
        controller = Controller([countries, cities])
        views = controller.list()
        v1 = ty.cast(ctrl.SelectView, self.get_by_id(countries.get_id(), views))
        v2 = ty.cast(ctrl.SelectView, self.get_by_id(cities.get_id(), views))

        self.assertEqual(["United States", "German"], v1.titles)
        self.assertEqual(0, v1.selected)
        self.assertEqual(["New York", "San Francisco", "Boston"], v2.titles)

        v1.selected = 1
        views = controller.list(views)

        v1 = ty.cast(ctrl.SelectView, self.get_by_id(countries.get_id(), views))
        v2 = ty.cast(ctrl.SelectView, self.get_by_id(cities.get_id(), views))
        self.assertEqual(1, v1.selected)
        self.assertEqual(["Munich", "Berlin", "Hamburg"], v2.titles)

    def test_apply_button_enabled(self):
        c1 = ctrl.Input(None)
        controller = Controller([c1])
        self.assertEqual(2, len(controller.list()))
        apply_view = self.get_apply(controller.list())
        self.assertIsNotNone(apply_view)
        self.assertFalse(apply_view.enabled)

        c1.apply(ctrl.InputView(c1.get_id(), text="10", enabled=True))
        apply_view = self.get_apply(controller.list())
        self.assertTrue(apply_view.enabled)

    def test_controller_apply(self):
        def update(control, text_field):
            control.text = str(int(text_field.text) * 2)

        c1 = ctrl.Input("10")
        c2 = ctrl.Input(depends=c1, handler=update)

        def test():
            return 30

        o1 = ctrl.Output(data=test)

        controller = Controller([c1, c2, o1])
        views = controller.list()
        self.assertEqual(30, views[2].data)

    def test_tqdm(self):
        tqdm_state = {}

        class Handler(TqdmHandler):
            def close(self, tqdm: tqdm):
                tqdm_state[tqdm.n] = {"desc": tqdm.desc, "n": tqdm.n, "total": tqdm.total,
                                      "elapsed": tqdm.format_dict["elapsed"]}

            def display(self, tqdm: tqdm):
                tqdm_state[tqdm.n] = {"desc": tqdm.desc, "n": tqdm.n, "total": tqdm.total,
                                      "elapsed": tqdm.format_dict["elapsed"]}

        set_tqdm_handler(Handler())

        def output_handler(output):
            for _ in trange(3, desc="Calculating data"):
                time.sleep(0.25)
            output.data = "success"

        o1 = ctrl.Output(handler=output_handler)
        controller = Controller([o1])
        views = controller.list()

        def apply():
            controller.list(views, True)

        apply()

        for i in range(4):
            self.assertEqual(i, tqdm_state[i]["n"])
            self.assertEqual(3, tqdm_state[i]["total"])
            self.assertEqual("Calculating data", tqdm_state[i]["desc"])

        set_tqdm_handler(None)

    def test_title_override(self):
        class Item:
            def __init__(self, id, title):
                self.id = id
                self.title = title

            def __repr__(self):
                return self.title

        items = ctrl.Select([Item(1, "hello"), Item(2, "world")], title=lambda x: x.title.upper())
        controller = Controller([items])
        views = controller.list()
        items_view = ty.cast(ctrl.SelectView, views[0])
        self.assertEqual(["HELLO", "WORLD"], items_view.titles)

    def test_optional(self):
        c1 = ctrl.Input(None, optional=True)
        controller = Controller([c1])
        self.assertEqual(2, len(controller.list()))
        apply_view = self.get_apply(controller.list())
        c1_view = self.get_by_id(c1.get_id(), controller.list())
        self.assertIsNotNone(apply_view)
        self.assertTrue(apply_view.enabled)
        self.assertFalse(apply_view.optional)
        self.assertTrue(c1_view.optional)

    def test_pack(self):
        c1 = ctrl.Input(None, label="my text", optional=True)
        v1 = c1.view()
        p1 = v1.pack()

        self.assertEqual(c1.get_id(), p1["id"])
        self.assertEqual(None, p1["data"])
        self.assertTrue(p1["enabled"])
        self.assertTrue(p1["optional"])
        self.assertEqual("my text", p1["label"])
        self.assertEqual(v1.__class__.__name__, p1["type"])

        c2 = ctrl.Input("10")
        p2 = c2.view().pack()
        self.assertFalse(p2["optional"])
        self.assertEqual("10", p2["data"])

        c3 = ctrl.Select(["Hello", "World"])
        p3 = c3.view().pack()
        self.assertEqual(0, p3["selected"])
        self.assertFalse(p3["optional"])
        self.assertEqual(["Hello", "World"], p3["titles"])

        c5 = ctrl.Slider(range(0, 10), selected=3)
        p5 = c5.view().pack()
        self.assertEqual(list(range(0, 10)), p5["data"])
        self.assertEqual(3, p5["selected"])
