from pydantic import BaseModel
from ..models.usuario import RolUsuario

class UsuarioBase(BaseModel):
    nombre: str
    carne_identidad: str
    direccion: str
    email: str

class UsuarioCreate(UsuarioBase):
    password: str  # Para crear usuarios

class Usuario(UsuarioBase):
    id: int
    rol: RolUsuario

    class Config:
        from_attributes = True  # Solo usamos esta propiedad, eliminamos orm_mode