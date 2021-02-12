import dstack.controls as ctrl
import dstack as ds


def bar():
    print("Here is bar!")


def foo():
    bar()
    print("Here is foo!")


def test_app(self: ctrl.Output, x: ctrl.Input, y: ctrl.Input):
    foo()
    print(f"My app: x={x.value()} y={y.value()}")
    self.data = int(x.value()) + int(y.value())
