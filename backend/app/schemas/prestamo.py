from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PrestamoBase(BaseModel):
    usuario_id: int
    material_id: int

class PrestamoCreate(PrestamoBase):
    pass

class Prestamo(PrestamoBase):
    id: int
    fecha_prestamo: datetime
    fecha_devolucion: Optional[datetime] = None
    estado: str

    class Config:
        orm_mode = True
