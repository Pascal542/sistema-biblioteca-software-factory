from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MaterialBase(BaseModel):
    titulo: str
    autor: str
    tipo: str
    descripcion: str
    ubicacion: str
    estado: str
    cantidad: int
    total: int
    año_publicacion: int

class MaterialCreate(MaterialBase):
    pass

class MaterialUpdate(BaseModel):
    titulo: Optional[str] = None
    autor: Optional[str] = None
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    ubicacion: Optional[str] = None
    estado: Optional[str] = None
    cantidad: Optional[int] = None
    total: Optional[int] = None
    año_publicacion: Optional[int] = None

class MaterialResponse(MaterialBase):
    id: int
    fecha_adquisicion: datetime
    activo: bool
    factor_estancia: float
    
    class Config:
        from_attributes = True