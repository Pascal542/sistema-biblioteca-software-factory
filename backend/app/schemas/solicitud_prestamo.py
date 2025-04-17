from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SolicitudPrestamoBase(BaseModel):
    nombre_usuario: str
    carne_identidad: str
    direccion_usuario: str
    material_id: int
    observaciones: Optional[str] = None

class SolicitudPrestamoCreate(SolicitudPrestamoBase):
    pass

class SolicitudPrestamoUpdate(BaseModel):
    estado: Optional[str] = None
    observaciones: Optional[str] = None

class SolicitudPrestamo(SolicitudPrestamoBase):
    id: int
    fecha_solicitud: datetime
    estado: str

    class Config:
        orm_mode = True

class SolicitudRevistaDetalle(BaseModel):
    id: int
    nombre_usuario: str
    direccion_usuario: str
    titulo_material: str
    fecha_solicitud: datetime
    estado: str
    observaciones: Optional[str] = None

    class Config:
        from_attributes = True 