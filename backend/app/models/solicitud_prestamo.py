from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class SolicitudPrestamo(Base):
    __tablename__ = "solicitudes_prestamo"

    id = Column(Integer, primary_key=True, index=True)
    nombre_usuario = Column(String)
    carne_identidad = Column(String)
    direccion_usuario = Column(String)
    material_id = Column(Integer, ForeignKey("materiales.id"))
    fecha_solicitud = Column(DateTime, default=datetime.now)
    estado = Column(String, default="pendiente")  # pendiente, aprobada, rechazada
    observaciones = Column(String, nullable=True)

    material = relationship("Material") 