from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PrestamoBase(BaseModel):
    usuario_id: int
    material_id: int

class PrestamoCreate(PrestamoBase):
    pass

class PrestamoUpdate(BaseModel):
    fecha_devolucion_real: Optional[datetime] = None
    estado: Optional[str] = None

class PrestamoResponse(PrestamoBase):
    id: int
    fecha_prestamo: datetime
    fecha_devolucion_esperada: datetime
    fecha_devolucion_real: Optional[datetime] = None
    estado: str
    activo: bool
    
    class Config:
        from_attributes = True