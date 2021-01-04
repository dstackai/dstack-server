import unittest
from sys import version as python_version, version_info as python_version_info

import matplotlib.pyplot as plt
import numpy as np

import dstack as ds
from tests import TestBase


class StackFrameTest(TestBase):
    def test_cant_send_access(self):
        self.protocol.broke()
        try:
            ds.frame(stack="plots/my_plot")
            self.fail("Error must be raised in send_access()")
        except RuntimeError:
            pass

    def test_single_plot(self):
        frame = ds.frame(stack="plots/my_plot")
        t = np.arange(0.0, 2.0, 0.01)
        s = 1 + np.sin(2 * np.pi * t)
        fig, ax = plt.subplots()
        ax.plot(t, s)
        my_desc = "My first plot"
        ax.set(xlabel="t", ylabel="x", title=my_desc)
        ax.grid()
        frame.add(fig, my_desc)
        frame.push()

        self.assertIn("user/plots/my_plot", self.protocol.data)
        attachments = self.get_data("plots/my_plot")["attachments"]
        self.assertIsNotNone(self.get_data("plots/my_plot")["id"])
        self.assertEqual("my_token", self.protocol.token)
        self.assertEqual(1, len(attachments))
        self.assertEqual("image/svg+xml", attachments[0]["content_type"])
        self.assertEqual("matplotlib", attachments[0]["application"])
        self.assertNotIn("params", attachments[0].keys())
        self.assertEqual(my_desc, attachments[0]["description"])

    def test_multiple_plots(self):
        stack = "plots/my_plot"
        frame = ds.frame(stack=stack)
        p = np.arange(0.0, 1.0, 0.1)

        for idx, phase in enumerate(p):
            t = np.arange(0.0, 2.0, 0.01)
            s = 1 + np.sin(2 * np.pi * t + phase)
            fig, ax = plt.subplots()
            ax.plot(t, s)
            ax.set(xlabel="t", ylabel="x", title="Plot with parameters")
            ax.grid()
            frame.add(fig, params={"phase": phase, "index": idx})

        frame.push()
        attachments = self.get_data(stack)["attachments"]
        self.assertEqual(len(p), len(attachments))
        for idx, phase in enumerate(p):
            att = attachments[idx]
            self.assertNotIn("description", att.keys())
            self.assertEqual(2, len(att["params"].keys()))
            self.assertEqual(idx, att["params"]["index"])
            self.assertEqual(phase, att["params"]["phase"])

    def test_stack_relative_path(self):
        frame = ds.frame(stack="plots/my_plot")
        frame.add(self.get_figure())
        frame.push()
        self.assertIn(f"user/plots/my_plot", self.protocol.data)

    def test_stack_absolute_path(self):
        frame = ds.frame(stack="/other/my_plot")
        frame.add(self.get_figure())
        frame.push()
        self.assertIn(f"other/my_plot", self.protocol.data)

    def test_stack_path(self):
        def stack_path(user: str, stack: str) -> str:
            context = ds.Context(stack, ds.Profile("", user, None, "", verify=True), self.protocol)
            return context.stack_path()

        self.assertEqual("test/project11/good_stack", stack_path("test", "project11/good_stack"))
        self.assertFailed(stack_path, "test", "плохой_стек")
        self.assertFailed(stack_path, "test", "bad stack")

    def test_add(self):
        stack = "my_stack"
        frame = ds.frame(stack=stack)
        params = {"my param": 1, "x": 2}
        frame.add(self.get_figure(), **params)
        frame.push(ds.FrameMeta(message="test", y=10))
        attachments = self.get_data(stack)["attachments"]
        self.assertEqual(2, len(attachments[0]["params"]))
        self.assertEqual(2, attachments[0]["params"]["x"])
        self.assertEqual(1, attachments[0]["params"]["my param"])
        ps = self.get_data(stack)["params"]
        self.assertEqual(2, len(ps))
        self.assertEqual("test", ps["message"])
        self.assertEqual(10, ps["y"])

    def test_push_params(self):
        stack = "test/my_plot"
        ds.push(stack, self.get_figure(), params={"z": 30}, meta=ds.FrameMeta(text="hello", x=10, y=20))
        frame = self.get_data(stack)
        attachments = frame["attachments"]
        self.assertEqual(1, len(attachments[0]["params"]))
        self.assertEqual(30, attachments[0]["params"]["z"])
        self.assertEqual(3, len(frame["params"]))
        self.assertEqual({"x": 10, "y": 20, "text": "hello"}, frame["params"])

    def test_stack_access(self):
        ds.push("test/my_plot", self.get_figure())
        self.assertNotIn("access", self.get_data("test/my_plot"))

        ds.push("test/my_plot_1", self.get_figure(), access="public")
        self.assertEqual("public", self.get_data("test/my_plot_1")["access"])

        ds.push("test/my_plot_2", self.get_figure(), access="private")
        self.assertEqual("private", self.get_data("test/my_plot_2")["access"])

    def test_per_frame_settings(self):
        ds.push("test/my_plot", self.get_figure())
        self.assertEqual(python_version, self.get_data("test/my_plot")["settings"]["python"]["version"])
        self.assertEqual(python_version_info.major, self.get_data("test/my_plot")["settings"]["python"]["major"])
        self.assertEqual(python_version_info.minor, self.get_data("test/my_plot")["settings"]["python"]["minor"])
        self.assertEqual(python_version_info.micro, self.get_data("test/my_plot")["settings"]["python"]["micro"])
        self.assertEqual(python_version_info.releaselevel,
                         self.get_data("test/my_plot")["settings"]["python"]["releaselevel"])
        self.assertEqual(python_version_info.serial, self.get_data("test/my_plot")["settings"]["python"]["serial"])
        self.assertIn("os", self.get_data("test/my_plot")["settings"])

    def test_tab(self):
        ds.push("test/my_plot", self.get_figure(), my_tab=ds.tab("My brand new tab"))
        t = self.get_data("test/my_plot")["attachments"][0]["params"]["my_tab"]
        self.assertIsNotNone(t)
        self.assertEqual("tab", t["type"])
        self.assertEqual("My brand new tab", t["title"])

    def assertFailed(self, func, *args):
        try:
            func(*args)
            self.fail()
        except ValueError:
            pass

    @staticmethod
    def get_figure():
        fig = plt.figure()
        plt.plot([1, 2, 3, 4], [1, 4, 9, 16])
        return fig


if __name__ == '__main__':
    unittest.main()
