from .usuarios import router as usuarios_router
from .materiales import router as materiales_router
from .prestamos import router as prestamos_router
from .solicitudes_prestamo import router as solicitudes_prestamo_router
from .auth import router as auth_router

__all__ = [
    "usuarios_router",
    "materiales_router",
    "prestamos_router",
    "solicitudes_prestamo_router",
    "auth_router"
]