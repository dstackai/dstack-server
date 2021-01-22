import typing as ty
from unittest import TestCase
from datetime import date

import dstack.controls as ctrl
from dstack.controls import Controller, ApplyView
from dstack import app


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
        c1 = ctrl.CheckBox()
        controller = Controller([c1], outputs=[])
        views = controller.list()
        v1 = ty.cast(ctrl.CheckBoxView, self.get_by_id(c1.get_id(), views))
        self.assertEqual(False, v1.selected)

    def test_callable_check_box(self):
        def get_selected():
            return True

        c1 = ctrl.CheckBox(selected=get_selected)
        controller = Controller([c1], outputs=[])
        views = controller.list()
        v1 = ty.cast(ctrl.CheckBoxView, self.get_by_id(c1.get_id(), views))
        self.assertEqual(True, v1.selected)

    def test_dependant_check_box(self):
        def get_selected(self: ctrl.CheckBox, c2: ctrl.TextField):
            self.selected = int(c2.value()) > 5

        c1 = ctrl.TextField("10")
        c2 = ctrl.CheckBox(handler=get_selected, depends=[c1])
        controller = Controller([c1, c2], outputs=[])
        views = controller.list()
        v1 = ty.cast(ctrl.TextFieldView, self.get_by_id(c1.get_id(), views))
        v2 = ty.cast(ctrl.CheckBoxView, self.get_by_id(c2.get_id(), views))
        self.assertEqual("10", v1.data)
        self.assertEqual(True, v2.selected)
        v1.data = "5"
        views = controller.list(views)
        v1 = ty.cast(ctrl.TextFieldView, self.get_by_id(c1.get_id(), views))
        v2 = ty.cast(ctrl.CheckBoxView, self.get_by_id(c2.get_id(), views))
        self.assertEqual("5", v1.data)
        self.assertEqual(False, v2.selected)

    def test_simple_update(self):
        def update(control: ctrl.Control, text_field: ctrl.TextField):
            control.data = str(int(text_field.data) * 2)

        c1 = ctrl.TextField("10", id="c1")
        c2 = ctrl.TextField(id="c2", depends=c1, handler=update, long=True)
        controller = Controller([c1, c2], outputs=[])
        views = controller.list()
        self.assertEqual(3, len(views))  # Apply will appear here
        ids = [v.id for v in views]
        self.assertIn(c1.get_id(), ids)
        self.assertIn(c2.get_id(), ids)

        v1 = self.get_by_id(c1.get_id(), views)
        v2 = self.get_by_id(c2.get_id(), views)

        if isinstance(v1, ctrl.TextFieldView):
            self.assertEqual("10", v1.data)
            self.assertIsNone(v1.long)
        else:
            self.fail()

        if isinstance(v2, ctrl.TextFieldView):
            self.assertEqual("20", v2.data)
            self.assertIsNotNone(v2.long)
        else:
            self.fail()

        views = controller.list(views)
        v1 = self.get_by_id(c1.get_id(), views)
        v2 = self.get_by_id(c2.get_id(), views)

        if isinstance(v1, ctrl.TextFieldView):
            self.assertEqual("10", v1.data)
            self.assertIsNone(v1.long)
        else:
            self.fail()

        if isinstance(v2, ctrl.TextFieldView):
            self.assertEqual("20", v2.data)
            self.assertIsNotNone(v2.long)

    def test_update_error(self):
        def update(control: ctrl.Control, text_area: ctrl.TextField):
            raise ValueError()

        c1 = ctrl.TextField("10", id="c1")
        c2 = ctrl.TextField(id="c2", depends=c1, handler=update)

        controller = Controller([c1, c2], outputs=[])

        try:
            controller.list(controller.list())
            self.fail()
        except ctrl.UpdateError as e:
            self.assertEqual(c2.get_id(), e.id)

    def test_handler_called_only_once(self):
        count = 0

        def update_c2(control: ctrl.Control, text_area: ctrl.TextField):
            nonlocal count
            if count == 0:
                count += 1
            else:
                print(count)
                raise RuntimeError()

            control.data = str(int(text_area.data) * 2)

        def update_c3_c4(control: ctrl.Control, text_area: ctrl.TextField):
            control.data = str(int(text_area.data) * 2)

        c1 = ctrl.TextField("10", id="c1")
        c2 = ctrl.TextField(id="c2", depends=c1, handler=update_c2)
        c3 = ctrl.TextField(id="c3", depends=c2, handler=update_c3_c4)
        c4 = ctrl.TextField(id="c4", depends=c2, handler=update_c3_c4)

        controller = Controller([c1, c2, c3, c4], outputs=[])
        views = controller.list()
        self.assertEqual(1, count)
        v2 = ty.cast(ctrl.TextFieldView, self.get_by_id(c2.get_id(), views))
        v3 = ty.cast(ctrl.TextFieldView, self.get_by_id(c3.get_id(), views))
        v4 = ty.cast(ctrl.TextFieldView, self.get_by_id(c4.get_id(), views))

        self.assertEqual("20", v2.data)
        self.assertEqual("40", v3.data)
        self.assertEqual("40", v4.data)

    def test_file_uploader(self):
        file_uploader = ctrl.FileUploader()
        self.assertTrue(isinstance(file_uploader.data, list))

        controller = Controller([file_uploader], outputs=[])
        views = controller.list()
        file_uploader_view = ty.cast(ctrl.FileUploaderView, self.get_by_id(file_uploader.get_id(), views))
        self.assertTrue(isinstance(file_uploader_view.uploads, list))
        self.assertEqual({"uploads": []}, file_uploader_view._pack())
        today = date.today()
        file_uploader_view.uploads.append(ctrl.Upload("some_file_id", "some_file_name", 123, today))
        packed_view = {"id": file_uploader._id, "enabled": True, "label": None, "optional": False,
                       "type": "FileUploaderView", "uploads": [
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
        self.assertTrue(isinstance(unpacked_view, ctrl.FileUploaderView))
        self.assertTrue(isinstance(unpacked_view.uploads, list))
        self.assertEqual(len(unpacked_view.uploads), 1)
        unpacked_upload = unpacked_view.uploads[0]
        self.assertEqual(unpacked_upload.id, "some_file_id")
        self.assertEqual(unpacked_upload.file_name, "some_file_name")
        self.assertEqual(unpacked_upload.length, 123)
        self.assertEqual(unpacked_upload.created_date, today)

    def test_combo_box(self):
        def update(control: ctrl.ComboBox, parent: ctrl.ComboBox):
            selected = parent.data[parent.selected]
            control.data = [f"{selected} 1", f"{selected} 2"]

        cb = ctrl.ComboBox(["Hello", "World"], id="cb")
        self.assertTrue(isinstance(cb._derive_model(), ctrl.DefaultListModel))

        c1 = ctrl.ComboBox(handler=update, depends=cb, id="c1")
        controller = Controller([c1, cb], outputs=[])
        views = controller.list()
        v = ty.cast(ctrl.ComboBoxView, self.get_by_id(cb.get_id(), views))
        v1 = ty.cast(ctrl.ComboBoxView, self.get_by_id(c1.get_id(), views))

        self.assertEqual(0, v.selected)
        self.assertEqual(["Hello 1", "Hello 2"], v1.titles)

        v.selected = 1
        print(views)
        views = controller.list(views)
        print(views)
        v = ty.cast(ctrl.ComboBoxView, self.get_by_id(cb.get_id(), views))
        v1 = ty.cast(ctrl.ComboBoxView, self.get_by_id(c1.get_id(), views))

        self.assertEqual(1, v.selected)
        self.assertEqual(["World 1", "World 2"], v1.titles)

    def test_multiple_combo_box(self):
        def update(control: ctrl.ComboBox, parent: ctrl.ComboBox):
            selected = [parent.data[s] for s in parent.selected]
            control.data = [f"{selected} 1", f"{selected} 2"]

        cb = ctrl.ComboBox(["Hello", "World"], id="cb", multiple=True)
        self.assertTrue(isinstance(cb._derive_model(), ctrl.DefaultListModel))

        c1 = ctrl.ComboBox(handler=update, depends=cb, id="c1")
        controller = Controller([c1, cb], outputs=[])
        views = controller.list()
        v = ty.cast(ctrl.ComboBoxView, self.get_by_id(cb.get_id(), views))
        v1 = ty.cast(ctrl.ComboBoxView, self.get_by_id(c1.get_id(), views))

        self.assertEqual([], v.selected)
        self.assertEqual(["[] 1", "[] 2"], v1.titles)

        v.selected = [1]
        print(views)
        views = controller.list(views)
        print(views)
        v = ty.cast(ctrl.ComboBoxView, self.get_by_id(cb.get_id(), views))
        v1 = ty.cast(ctrl.ComboBoxView, self.get_by_id(c1.get_id(), views))

        self.assertEqual([1], v.selected)
        self.assertEqual(["['World'] 1", "['World'] 2"], v1.titles)

        v.selected = [0, 1]
        print(views)
        views = controller.list(views)
        print(views)
        v = ty.cast(ctrl.ComboBoxView, self.get_by_id(cb.get_id(), views))
        v1 = ty.cast(ctrl.ComboBoxView, self.get_by_id(c1.get_id(), views))

        self.assertEqual([0, 1], v.selected)
        self.assertEqual(["['Hello', 'World'] 1", "['Hello', 'World'] 2"], v1.titles)

    def test_immutability_of_controller(self):
        text_field = ctrl.TextField(data="Some initial data")
        controller = Controller([text_field], outputs=[])
        views = controller.list()
        self.assertEqual(views[0].data, "Some initial data")
        views[0].data = "Some other data"
        updated_views = controller.list(views)
        self.assertEqual(updated_views[0].data, "Some other data")
        views = controller.list()
        self.assertEqual(views[0].data, "Some initial data")

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

        def update_cities(control: ctrl.ComboBox, parent: ctrl.ComboBox):
            country = ty.cast(Country, parent.get_model().element(parent.selected))
            control.data = list_cities_from_db_by_code(country)

        countries = ctrl.ComboBox(list_countries_from_db, id="countries")
        self.assertTrue(isinstance(countries._derive_model(), ctrl.CallableListModel))

        cities = ctrl.ComboBox(handler=update_cities, id="cities", depends=countries)
        controller = Controller([countries, cities], outputs=[])
        views = controller.list()
        v1 = ty.cast(ctrl.ComboBoxView, self.get_by_id(countries.get_id(), views))
        v2 = ty.cast(ctrl.ComboBoxView, self.get_by_id(cities.get_id(), views))

        self.assertEqual(["United States", "German"], v1.titles)
        self.assertEqual(0, v1.selected)
        self.assertEqual(["New York", "San Francisco", "Boston"], v2.titles)

        v1.selected = 1
        views = controller.list(views)

        v1 = ty.cast(ctrl.ComboBoxView, self.get_by_id(countries.get_id(), views))
        v2 = ty.cast(ctrl.ComboBoxView, self.get_by_id(cities.get_id(), views))
        self.assertEqual(1, v1.selected)
        self.assertEqual(["Munich", "Berlin", "Hamburg"], v2.titles)

    def test_apply_button_enabled(self):
        c1 = ctrl.TextField(None, id="c1")
        controller = Controller([c1], outputs=[])
        self.assertEqual(2, len(controller.list()))
        apply_view = self.get_apply(controller.list())
        self.assertIsNotNone(apply_view)
        self.assertFalse(apply_view.enabled)

        c1.apply(ctrl.TextFieldView(c1.get_id(), data="10", enabled=True))
        apply_view = self.get_apply(controller.list())
        self.assertTrue(apply_view.enabled)

    def test_controller_apply(self):
        def update(control, text_field):
            control.data = str(int(text_field.data) * 2)

        c1 = ctrl.TextField("10", id="c1")
        c2 = ctrl.TextField(id="c2", depends=c1, handler=update)

        def test(self: ctrl.Output, x: ctrl.Control, y: ctrl.Control):
            self.data = int(x.value()) + int(y.value())

        o1 = ctrl.Output(handler=test)
        my_app = app(controls=[c1, c2], outputs=[o1], project=True)

        controller = Controller([c1, c2], outputs=my_app.outputs)
        views = controller.list()
        # print(views)
        self.assertEqual(30, controller.apply(views)[0].data)
        self.assertIsNone(controller._outputs[0].data)

    def test_title_override(self):
        class Item:
            def __init__(self, id, title):
                self.id = id
                self.title = title

            def __repr__(self):
                return self.title

        items = ctrl.ComboBox([Item(1, "hello"), Item(2, "world")], title=lambda x: x.title.upper())
        controller = Controller([items], outputs=[])
        views = controller.list()
        items_view = ty.cast(ctrl.ComboBoxView, views[0])
        self.assertEqual(["HELLO", "WORLD"], items_view.titles)

    def test_optional(self):
        c1 = ctrl.TextField(None, id="c1", optional=True)
        controller = Controller([c1], outputs=[])
        self.assertEqual(2, len(controller.list()))
        apply_view = self.get_apply(controller.list())
        c1_view = self.get_by_id("c1", controller.list())
        self.assertIsNotNone(apply_view)
        self.assertTrue(apply_view.enabled)
        self.assertFalse(apply_view.optional)
        self.assertTrue(c1_view.optional)

    def test_pack(self):
        c1 = ctrl.TextField(None, id="c1", label="my text", optional=True)
        v1 = c1.view()
        p1 = v1.pack()

        self.assertEqual("c1", p1["id"])
        self.assertEqual(None, p1["data"])
        self.assertTrue(p1["enabled"])
        self.assertTrue(p1["optional"])
        self.assertEqual("my text", p1["label"])
        self.assertEqual(v1.__class__.__name__, p1["type"])

        c2 = ctrl.TextField("10", id="c1")
        p2 = c2.view().pack()
        self.assertFalse(p2["optional"])
        self.assertEqual("10", p2["data"])

        c3 = ctrl.ComboBox(["Hello", "World"], id="c3")
        p3 = c3.view().pack()
        self.assertEqual(0, p3["selected"])
        self.assertFalse(p3["optional"])
        self.assertEqual(["Hello", "World"], p3["titles"])

        c5 = ctrl.Slider(range(0, 10), id="c5", selected=3)
        p5 = c5.view().pack()
        self.assertEqual(list(range(0, 10)), p5["data"])
        self.assertEqual(3, p5["selected"])
