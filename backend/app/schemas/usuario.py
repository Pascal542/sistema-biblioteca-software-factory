from pydantic import BaseModel

class UsuarioBase(BaseModel):
    nombre: str
    carne_identidad: str
    direccion: str

class UsuarioCreate(UsuarioBase):
    pass

class Usuario(UsuarioBase):
    id: int

    class Config:
        orm_mode = True
