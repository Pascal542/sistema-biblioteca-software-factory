from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    carne_identidad = Column(String, unique=True, index=True)
    direccion = Column(String)

    prestamos = relationship("Prestamo", back_populates="usuario")
