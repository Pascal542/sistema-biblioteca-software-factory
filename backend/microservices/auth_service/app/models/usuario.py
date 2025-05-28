from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    carne_identidad = Column(String(255), unique=True, index=True, nullable=False)
    direccion = Column(String(500), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    rol = Column(String(50), default="usuario")
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)