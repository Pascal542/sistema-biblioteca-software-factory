from ..database import Base
from .usuario import Usuario, RolUsuario  # Añadimos RolUsuario aquí
from .material import Material, Libro, Revista, ActaCongreso, GeneroLibro, FrecuenciaPublicacion
from .prestamo import Prestamo
from .solicitud_prestamo import SolicitudPrestamo

__all__ = [
    "Usuario",
    "RolUsuario",
    "Material",
    "Libro",
    "Revista",
    "ActaCongreso",
    "GeneroLibro",
    "FrecuenciaPublicacion",
    "Prestamo",
    "SolicitudPrestamo"
]