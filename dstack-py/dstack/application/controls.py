import dstack.controls as ctrl
from deprecation import deprecated
import typing as ty


@deprecated(details="Use dstack.controls.unpack_view instead")
def unpack_view(source: ty.Dict) -> ctrl.View:
    return ctrl.unpack_view(source)
