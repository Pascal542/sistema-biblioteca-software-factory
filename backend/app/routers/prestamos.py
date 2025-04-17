from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from .. import models
from ..schemas import prestamo

router = APIRouter()

@router.post("/", response_model=prestamo.Prestamo)
def crear_prestamo(prestamo_data: prestamo.PrestamoCreate, db: Session = Depends(get_db)):
    # Verificar si el usuario existe
    usuario = db.query(models.Usuario).filter(models.Usuario.id == prestamo_data.usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Verificar si el material existe
    material = db.query(models.Material).filter(models.Material.id == prestamo_data.material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material no encontrado"
        )
    
    # Verificar si hay ejemplares disponibles
    if material.cantidad_prestamo >= material.cantidad_total:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No hay ejemplares disponibles para préstamo"
        )
    
    # Crear el préstamo
    db_prestamo = models.Prestamo(**prestamo_data.dict())
    material.cantidad_prestamo += 1
    
    db.add(db_prestamo)
    db.commit()
    db.refresh(db_prestamo)
    return db_prestamo

@router.get("/", response_model=List[prestamo.Prestamo])
def obtener_prestamos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    prestamos = db.query(models.Prestamo).offset(skip).limit(limit).all()
    return prestamos

@router.get("/{prestamo_id}", response_model=prestamo.Prestamo)
def obtener_prestamo(prestamo_id: int, db: Session = Depends(get_db)):
    db_prestamo = db.query(models.Prestamo).filter(models.Prestamo.id == prestamo_id).first()
    if db_prestamo is None:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    return db_prestamo

@router.put("/{prestamo_id}", response_model=prestamo.Prestamo)
def actualizar_prestamo(
    prestamo_id: int,
    prestamo_update: prestamo.PrestamoUpdate,
    db: Session = Depends(get_db)
):
    db_prestamo = db.query(models.Prestamo).filter(models.Prestamo.id == prestamo_id).first()
    if db_prestamo is None:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    
    # Si se está marcando como devuelto
    if prestamo_update.estado == "devuelto" and db_prestamo.estado != "devuelto":
        material = db.query(models.Material).filter(models.Material.id == db_prestamo.material_id).first()
        if material:
            material.cantidad_prestamo -= 1
        prestamo_update.fecha_devolucion = datetime.now()
    
    # Actualizar los campos
    for key, value in prestamo_update.dict(exclude_unset=True).items():
        setattr(db_prestamo, key, value)
    
    db.commit()
    db.refresh(db_prestamo)
    return db_prestamo

@router.delete("/{prestamo_id}")
def eliminar_prestamo(prestamo_id: int, db: Session = Depends(get_db)):
    db_prestamo = db.query(models.Prestamo).filter(models.Prestamo.id == prestamo_id).first()
    if db_prestamo is None:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    
    # Si el préstamo está activo, actualizar la cantidad de materiales prestados
    if db_prestamo.estado == "activo":
        material = db.query(models.Material).filter(models.Material.id == db_prestamo.material_id).first()
        if material:
            material.cantidad_prestamo -= 1
    
    db.delete(db_prestamo)
    db.commit()
    return {"message": "Préstamo eliminado correctamente"}

@router.get("/cliente/{carne_identidad}", response_model=List[prestamo.MaterialPrestado])
def obtener_materiales_prestados_por_cliente(
    carne_identidad: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de materiales prestados a un cliente específico por su carné de identidad.
    Incluye el título y autor de cada material, así como la fecha de préstamo y estado.
    """
    # Buscar el usuario por carné de identidad
    usuario = db.query(models.Usuario).filter(models.Usuario.carne_identidad == carne_identidad).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Obtener los préstamos activos del usuario
    prestamos = (
        db.query(models.Prestamo, models.Material)
        .join(models.Material)
        .filter(
            models.Prestamo.usuario_id == usuario.id,
            models.Prestamo.estado == "activo"
        )
        .all()
    )
    
    return [
        prestamo.MaterialPrestado(
            titulo=material.titulo,
            autor=material.autor,
            fecha_prestamo=p.fecha_prestamo,
            estado=p.estado
        )
        for p, material in prestamos
    ]
