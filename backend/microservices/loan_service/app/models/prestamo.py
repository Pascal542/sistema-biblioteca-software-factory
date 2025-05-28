from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from app.database import Base
import datetime

class Prestamo(Base):
    __tablename__ = "prestamos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer)
    material_id = Column(Integer)
    fecha_prestamo = Column(DateTime, default=datetime.datetime.utcnow)
    fecha_devolucion_esperada = Column(DateTime)
    fecha_devolucion_real = Column(DateTime, nullable=True)
    estado = Column(String(50))
    activo = Column(Boolean, default=True)