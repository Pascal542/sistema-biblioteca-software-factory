from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from ..database import Base

class GeneroLibro(str, PyEnum):
    INFANTIL = "Infantil"
    CIENCIA_FICCION = "Ciencia ficción"
    HISTORIA_ANTIGUA = "Historia Antigua"

class FrecuenciaPublicacion(str, PyEnum):
    TRIMESTRAL = "trimestral"
    SEMESTRAL = "semestral"
    ANUAL = "anual"

class Material(Base):
    __tablename__ = "materiales"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String)  # 'libro', 'revista', 'acta'
    identificador = Column(String, unique=True, index=True)
    titulo = Column(String)
    autor = Column(String)
    anio_publicacion = Column(Integer)
    anio_llegada = Column(Integer)
    editorial = Column(String)
    cantidad_total = Column(Integer)
    cantidad_prestamo = Column(Integer, default=0)

    __mapper_args__ = {
        'polymorphic_identity': 'material',
        'polymorphic_on': tipo
    }

    def calcular_factor_estancia(self) -> float:
        try:
            llegada = int(self.anio_llegada)
            if llegada <= 0:
                return 0.0
            return (self.anio_publicacion + 1) / llegada
        except (ValueError, TypeError, ZeroDivisionError):
            return 0.0

class Libro(Material):
    __tablename__ = "libros"

    id = Column(Integer, ForeignKey('materiales.id'), primary_key=True)
    genero = Column(Enum(GeneroLibro))

    __mapper_args__ = {
        'polymorphic_identity': 'libro',
    }

    def calcular_factor_estancia(self) -> float:
        base = (self.anio_publicacion + 1) / self.anio_llegada
        
        if self.genero == GeneroLibro.INFANTIL:
            return base * 1.05
        elif self.genero == GeneroLibro.CIENCIA_FICCION:
            return base * 0.6
        elif self.genero == GeneroLibro.HISTORIA_ANTIGUA:
            return base * 1.2
        return base

class Revista(Material):
    __tablename__ = "revistas"

    id = Column(Integer, ForeignKey('materiales.id'), primary_key=True)
    frecuencia_publicacion = Column(Enum(FrecuenciaPublicacion))

    __mapper_args__ = {
        'polymorphic_identity': 'revista',
    }

    def calcular_factor_estancia(self) -> float:
        try:
            base = (self.anio_publicacion + 1) / self.anio_llegada

            if self.frecuencia_publicacion == FrecuenciaPublicacion.TRIMESTRAL:
                return base * 1.4
            elif self.frecuencia_publicacion == FrecuenciaPublicacion.SEMESTRAL:
                return base * 1.33
            elif self.frecuencia_publicacion == FrecuenciaPublicacion.ANUAL:
                return base * 1.15
            return base
        except ZeroDivisionError:
            return 0.0

class ActaCongreso(Material):
    __tablename__ = "actas_congreso"

    id = Column(Integer, ForeignKey('materiales.id'), primary_key=True)
    nombre_congreso = Column(String)

    __mapper_args__ = {
        'polymorphic_identity': 'acta',
    }

    def calcular_factor_estancia(self) -> float:
        try:
            llegada = int(self.anio_llegada)
            if llegada <= 0:
                return 0.0
            return (self.anio_publicacion + 1) / llegada
        except (ValueError, TypeError, ZeroDivisionError):
            return 0.0
