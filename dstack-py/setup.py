from pathlib import Path

from setuptools import setup


def get_version():
    text = (Path("dstack") / "version.py").read_text()
    return text.split("=")[1].strip()[1:-1]


setup(
    name="dstack",
    version=get_version(),
    author="swordhands",
    author_email="team@dstack.ai",
    packages=["dstack", "dstack.application", "dstack.cli", "dstack.files", "dstack.bokeh", "dstack.matplotlib",
              "dstack.pandas", "dstack.geopandas", "dstack.plotly", "dstack.sklearn", "dstack.tensorflow",
              "dstack.torch"],
    scripts=[],
    entry_points={
        "console_scripts": ["dstack=dstack.cli.main:main"],
    },
    url="https://dstack.ai",
    license="Apache License 2.0",
    description="An open-source library to publish plots",
    long_description=open("../README.md").read(),
    long_description_content_type="text/markdown",
    install_requires=[
        "pyyaml>=5.1",
        "requests",
        "deprecation",
        "packaging",
        "tqdm",
        "cloudpickle"
    ],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Topic :: Scientific/Engineering :: Visualization",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python :: 3"
    ]
)
