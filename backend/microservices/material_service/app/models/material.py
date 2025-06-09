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
    año_publicacion = Column(Integer)
    fecha_adquisicion = Column(DateTime, default=datetime.datetime.utcnow)
    activo = Column(Boolean, default=True)
    
    @property
    def factor_estancia(self) -> float:
        """Calcula el factor de estancia basado en el tipo del material"""
        if not self.año_publicacion or not self.fecha_adquisicion:
            return 0.0
            
        año_llegada = self.fecha_adquisicion.year
        base_factor = (self.año_publicacion + 1) / año_llegada
        
        if self.tipo.lower() == "libro":
            # Para libros, necesitarías determinar el subtipo de alguna manera
            # Por ahora usamos el factor base
            return base_factor
        elif self.tipo.lower() == "revista":
            # Para revistas, necesitarías determinar si es trimestral, semestral o anual
            # Por ahora usamos el factor base
            return base_factor
        elif self.tipo.lower() == "actas":
            return base_factor
            
        return base_factor