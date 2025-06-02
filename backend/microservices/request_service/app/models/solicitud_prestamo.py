from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.database import Base

class SolicitudPrestamo(Base):
    __tablename__ = "solicitudes_prestamo"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, nullable=False, index=True)
    material_id = Column(Integer, nullable=False, index=True)
    fecha_solicitud = Column(DateTime(timezone=True), server_default=func.now(), default=func.now())
    estado = Column(String(20), default="pendiente")
    observaciones = Column(Text, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)