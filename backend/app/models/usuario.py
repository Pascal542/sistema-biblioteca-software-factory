from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from ..database import Base

class RolUsuario(str, PyEnum):
    ADMIN = "admin"
    USUARIO = "usuario"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    carne_identidad = Column(String, unique=True, index=True)
    direccion = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    rol = Column(Enum(RolUsuario), default=RolUsuario.USUARIO)

    prestamos = relationship("Prestamo", back_populates="usuario")