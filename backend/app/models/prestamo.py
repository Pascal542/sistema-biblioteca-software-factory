from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Prestamo(Base):
    __tablename__ = "prestamos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    material_id = Column(Integer, ForeignKey("materiales.id"))
    fecha_prestamo = Column(DateTime, default=datetime.now)
    fecha_devolucion = Column(DateTime, nullable=True)
    estado = Column(String, default="activo")  # activo, devuelto

    usuario = relationship("Usuario", back_populates="prestamos")
    material = relationship("Material")
