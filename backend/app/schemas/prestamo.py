from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class PrestamoBase(BaseModel):
    usuario_id: int
    material_id: int

class PrestamoCreate(PrestamoBase):
    pass

class PrestamoUpdate(BaseModel):
    estado: Optional[str] = None
    fecha_devolucion: Optional[datetime] = None

class Prestamo(PrestamoBase):
    id: int
    fecha_prestamo: datetime
    fecha_devolucion: Optional[datetime] = None
    estado: str

    class Config:
        orm_mode = True

class MaterialPrestado(BaseModel):
    titulo: str
    autor: str
    fecha_prestamo: datetime
    estado: str

    class Config:
        from_attributes = True
