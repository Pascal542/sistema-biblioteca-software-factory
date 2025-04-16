from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from .. import models
from ..schemas import prestamo

router = APIRouter()

@router.post("/", response_model=prestamo.Prestamo)
def crear_prestamo(prestamo_data: prestamo.PrestamoCreate, db: Session = Depends(get_db)):
    # Verificar si el material está disponible
    material = db.query(models.Material).filter(models.Material.id == prestamo_data.material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material no encontrado")
    if material.cantidad_prestamo >= material.cantidad_total:
        raise HTTPException(status_code=400, detail="No hay ejemplares disponibles")

    # Verificar si el usuario existe
    usuario = db.query(models.Usuario).filter(models.Usuario.id == prestamo_data.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Crear el préstamo
    db_prestamo = models.Prestamo(
        **prestamo_data.dict(),
        fecha_prestamo=datetime.utcnow(),
        estado="activo"
    )
    
    # Actualizar la cantidad de préstamos del material
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

@router.put("/{prestamo_id}/devolver")
def devolver_prestamo(prestamo_id: int, db: Session = Depends(get_db)):
    db_prestamo = db.query(models.Prestamo).filter(models.Prestamo.id == prestamo_id).first()
    if db_prestamo is None:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    if db_prestamo.estado == "devuelto":
        raise HTTPException(status_code=400, detail="El préstamo ya fue devuelto")

    # Actualizar el préstamo
    db_prestamo.estado = "devuelto"
    db_prestamo.fecha_devolucion = datetime.utcnow()

    # Actualizar la cantidad de préstamos del material
    material = db.query(models.Material).filter(models.Material.id == db_prestamo.material_id).first()
    material.cantidad_prestamo -= 1

    db.commit()
    return {"message": "Préstamo devuelto correctamente"}
