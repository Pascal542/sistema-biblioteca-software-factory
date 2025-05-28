from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from app.database import Base
import datetime

class Material(Base):
    __tablename__ = "materiales"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(100))
    autor = Column(String(50))
    tipo = Column(String(20))
    descripcion = Column(String(255))
    ubicacion = Column(String(50))
    cantidad = Column(Integer)
    total = Column(Integer)
    estado = Column(String(30))
    fecha_adquisicion = Column(DateTime, default=datetime.datetime.utcnow)
    activo = Column(Boolean, default=True)