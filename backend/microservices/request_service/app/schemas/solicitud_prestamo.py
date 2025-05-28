from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SolicitudPrestamoCreate(BaseModel):
    usuario_id: int
    material_id: int
    observaciones: Optional[str] = None

class SolicitudPrestamoUpdate(BaseModel):
    estado: Optional[str] = None
    observaciones: Optional[str] = None

class SolicitudPrestamoResponse(BaseModel):
    id: int
    usuario_id: int
    material_id: int
    fecha_solicitud: datetime
    estado: str
    observaciones: Optional[str] = None
    activo: bool
    
    class Config:
        from_attributes = True