import dstack as ds
from dstack.md import Markdown
from tests import TestBase


class TestMarkdown(TestBase):
    def test_with_schema(self):
        md = Markdown("Test *markdown*")
        ds.push("test/md", md)
        frame_data = ds.pull_data(ds.create_context("test/md"))
        self.assertEqual("text/markdown", frame_data.content_type)
        self.assertEqual("markdown", frame_data.application)
        self.assertEqual(md.text, frame_data.data.value().decode("utf-8"))
