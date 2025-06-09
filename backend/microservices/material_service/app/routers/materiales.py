from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, asc
from sqlalchemy.orm import Session
from typing import List, Optional, Union
from app.database import get_db
from app.models.material import Material
from app.schemas.material import MaterialCreate, MaterialResponse, MaterialUpdate
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Esquemas para paginación
class PaginationInfo(BaseModel):
    total: int
    page: int
    size: int
    pages: int

class PaginatedMaterialResponse(BaseModel):
    data: List[MaterialResponse]
    pagination: PaginationInfo

# Esquemas adicionales para respuestas específicas
class MaterialDisponible(BaseModel):
    id: int
    tipo: str
    titulo: str
    cantidad_disponible: int
    cantidad_total: int

class PaginatedMaterialDisponibleResponse(BaseModel):
    data: List[MaterialDisponible]
    pagination: PaginationInfo

class MaterialEnPrestamo(BaseModel):
    tipo: str
    subtipo: Optional[str]
    titulo: str
    autor: str
    cantidad_prestada: int
    fecha_prestamo: datetime
    factor_estancia: float

@router.post("/", response_model=MaterialResponse)
def crear_material(material_data: MaterialCreate, db: Session = Depends(get_db)):
    # Crear un nuevo material
    db_material = Material(**material_data.dict())
    
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

@router.get("/", response_model=PaginatedMaterialResponse)
def obtener_materiales(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    titulo: Optional[str] = Query(None, description="Filtrar por título"),
    autor: Optional[str] = Query(None, description="Filtrar por autor"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    subtipo: Optional[str] = Query(None, description="Filtrar por subtipo"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista paginada de materiales con filtros opcionales.
    """
    # Calcular offset
    skip = (page - 1) * size
    
    # Construir query base
    query = db.query(Material).filter(Material.activo == True)
    
    # Aplicar filtros si se proporcionan
    if titulo:
        query = query.filter(Material.titulo.ilike(f"%{titulo}%"))
    if autor:
        query = query.filter(Material.autor.ilike(f"%{autor}%"))
    if tipo:
        query = query.filter(Material.tipo == tipo)
    if subtipo:
        query = query.filter(Material.subtipo == subtipo)
    if estado:
        query = query.filter(Material.estado == estado)
    
    # Obtener el total de registros
    total = query.count()
    
    # Obtener resultados paginados
    materiales = query.offset(skip).limit(size).all()
    
    # Calcular páginas
    pages = (total + size - 1) // size if total > 0 else 1
    
    return PaginatedMaterialResponse(
        data=materiales,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

@router.get("/ordenados", response_model=PaginatedMaterialResponse)
def obtener_materiales_ordenados(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    db: Session = Depends(get_db)
):
    """
    Obtiene un listado paginado de materiales ordenados por autor y título.
    """
    # Calcular offset
    skip = (page - 1) * size
    
    # Query base con ordenamiento
    query = db.query(Material).filter(Material.activo == True).order_by(asc(Material.autor), asc(Material.titulo))
    
    # Obtener el total de registros
    total = query.count()
    
    # Obtener resultados paginados
    materiales = query.offset(skip).limit(size).all()
    
    # Calcular páginas
    pages = (total + size - 1) // size if total > 0 else 1
    
    return PaginatedMaterialResponse(
        data=materiales,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

@router.get("/disponibles", response_model=PaginatedMaterialResponse)
def obtener_materiales_disponibles(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los materiales con estado 'disponible' con paginación
    """
    # Calcular offset
    skip = (page - 1) * size
    
    # Query base
    query = db.query(Material).filter(
        Material.estado == "disponible",
        Material.activo == True
    )
    
    # Obtener el total de registros
    total = query.count()
    
    # Obtener resultados paginados
    materiales = query.offset(skip).limit(size).all()
    
    # Calcular páginas
    pages = (total + size - 1) // size if total > 0 else 1
    
    return PaginatedMaterialResponse(
        data=materiales,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

@router.get("/por-tipo/{tipo}", response_model=PaginatedMaterialResponse)
def obtener_materiales_por_tipo(
    tipo: str,
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los materiales de un tipo específico con paginación
    """
    # Calcular offset
    skip = (page - 1) * size
    
    # Query base
    query = db.query(Material).filter(
        Material.tipo == tipo,
        Material.activo == True
    )
    
    # Obtener el total de registros
    total = query.count()
    
    # Obtener resultados paginados
    materiales = query.offset(skip).limit(size).all()
    
    # Calcular páginas
    pages = (total + size - 1) // size if total > 0 else 1
    
    return PaginatedMaterialResponse(
        data=materiales,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

@router.get("/buscar/avanzado", response_model=PaginatedMaterialResponse)
def buscar_materiales_avanzado(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    titulo: Optional[str] = Query(None, description="Filtrar por título"),
    autor: Optional[str] = Query(None, description="Filtrar por autor"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    subtipo: Optional[str] = Query(None, description="Filtrar por subtipo"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    db: Session = Depends(get_db)
):
    """
    Búsqueda avanzada de materiales con múltiples criterios y paginación.
    """
    # Calcular offset
    skip = (page - 1) * size
    
    # Query base
    query = db.query(Material).filter(Material.activo == True)
    
    # Aplicar filtros
    if titulo:
        query = query.filter(Material.titulo.ilike(f"%{titulo}%"))
    if autor:
        query = query.filter(Material.autor.ilike(f"%{autor}%"))
    if tipo:
        query = query.filter(Material.tipo == tipo)
    if subtipo:
        query = query.filter(Material.subtipo == subtipo)
    if estado:
        query = query.filter(Material.estado == estado)
    
    # Obtener el total de registros
    total = query.count()
    
    # Obtener resultados paginados
    materiales = query.offset(skip).limit(size).all()
    
    # Calcular páginas
    pages = (total + size - 1) // size if total > 0 else 1
    
    return PaginatedMaterialResponse(
        data=materiales,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

# Endpoint adicional para obtener estadísticas de materiales
@router.get("/estadisticas/resumen")
def obtener_estadisticas_materiales(db: Session = Depends(get_db)):
    """
    Obtiene estadísticas resumidas de los materiales.
    """
    total_materiales = db.query(func.count(Material.id)).filter(Material.activo == True).scalar()
    materiales_disponibles = db.query(func.count(Material.id)).filter(
        Material.estado == "disponible",
        Material.activo == True
    ).scalar()
    materiales_prestados = db.query(func.count(Material.id)).filter(
        Material.estado == "prestado",
        Material.activo == True
    ).scalar()
    
    # Contar por tipos
    tipos_count = db.query(
        Material.tipo,
        func.count(Material.id).label('count')
    ).filter(Material.activo == True).group_by(Material.tipo).all()
    
    return {
        "total_materiales": total_materiales,
        "materiales_disponibles": materiales_disponibles,
        "materiales_prestados": materiales_prestados,
        "por_tipo": [{"tipo": tipo, "cantidad": count} for tipo, count in tipos_count]
    }

@router.get("/{material_id}", response_model=MaterialResponse)
def obtener_material(material_id: int, db: Session = Depends(get_db)):
    db_material = db.query(Material).filter(
        Material.id == material_id,
        Material.activo == True
    ).first()
    if db_material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Material no encontrado"
        )
    return db_material

@router.put("/{material_id}", response_model=MaterialResponse)
def actualizar_material(
    material_id: int, 
    material_data: MaterialUpdate,
    db: Session = Depends(get_db)
):
    db_material = db.query(Material).filter(
        Material.id == material_id,
        Material.activo == True
    ).first()
    if db_material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Material no encontrado"
        )
    
    # Actualizar los campos
    update_data = material_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:  # Solo actualizar campos que no son None
            setattr(db_material, key, value)
    
    db.commit()
    db.refresh(db_material)
    return db_material

@router.patch("/{material_id}", response_model=MaterialResponse)
def actualizar_material_parcial(
    material_id: int, 
    material_data: MaterialUpdate,
    db: Session = Depends(get_db)
):
    """
    Endpoint para actualizaciones parciales, útil para cambiar solo el estado
    """
    db_material = db.query(Material).filter(
        Material.id == material_id,
        Material.activo == True
    ).first()
    if db_material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Material no encontrado"
        )
    
    # Actualizar los campos
    update_data = material_data.dict(exclude_unset=True, exclude_none=True)
    for key, value in update_data.items():
        setattr(db_material, key, value)
    
    db.commit()
    db.refresh(db_material)
    return db_material

@router.delete("/{material_id}")
def eliminar_material(material_id: int, db: Session = Depends(get_db)):
    db_material = db.query(Material).filter(
        Material.id == material_id,
        Material.activo == True
    ).first()
    if db_material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Material no encontrado"
        )
    
    # Verificar si el material está en préstamo
    if db_material.estado == "prestado":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar un material que está en préstamo"
        )
    
    # Usar soft delete en lugar de eliminar físicamente
    db_material.activo = False
    db.commit()
    
    return {"message": "Material eliminado correctamente"}