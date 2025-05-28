from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    carne_identidad: str
    direccion: str

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    carne_identidad: Optional[str] = None
    direccion: Optional[str] = None
    password: Optional[str] = None
    rol: Optional[str] = None
    activo: Optional[bool] = None

class UsuarioResponse(UsuarioBase):
    id: int
    rol: str
    activo: bool

    class Config:
        from_attributes = True