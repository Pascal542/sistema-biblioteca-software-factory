from pydantic import BaseModel
from typing import Optional
from enum import Enum

class GeneroLibro(str, Enum):
    INFANTIL = "Infantil"
    CIENCIA_FICCION = "Ciencia ficción"
    HISTORIA_ANTIGUA = "Historia Antigua"

class FrecuenciaPublicacion(str, Enum):
    TRIMESTRAL = "trimestral"
    SEMESTRAL = "semestral"
    ANUAL = "anual"

class MaterialBase(BaseModel):
    identificador: str
    titulo: str
    autor: str
    anio_publicacion: int
    anio_llegada: int
    editorial: str
    cantidad_total: int
    cantidad_prestamo: int = 0

class LibroCreate(MaterialBase):
    genero: GeneroLibro

class RevistaCreate(MaterialBase):
    frecuencia_publicacion: FrecuenciaPublicacion

class ActaCongresoCreate(MaterialBase):
    nombre_congreso: str

class Material(MaterialBase):
    id: int
    tipo: str
    factor_estancia: Optional[float] = None

    class Config:
        orm_mode = True
