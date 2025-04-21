from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models
from ..schemas import solicitud_prestamo

router = APIRouter()

@router.post("/", response_model=solicitud_prestamo.SolicitudPrestamo)
def crear_solicitud(
    solicitud: solicitud_prestamo.SolicitudPrestamoCreate,
    db: Session = Depends(get_db)
):
    # Verificar si el material existe
    material = db.query(models.Material).filter(models.Material.id == solicitud.material_id).first()
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
    
    # Crear la solicitud
    db_solicitud = models.SolicitudPrestamo(
        nombre_usuario=solicitud.nombre_usuario,
        carne_identidad=solicitud.carne_identidad,
        direccion_usuario=solicitud.direccion_usuario,
        material_id=solicitud.material_id,
        observaciones=solicitud.observaciones
    )
    db.add(db_solicitud)
    db.commit()
    db.refresh(db_solicitud)
    return db_solicitud

@router.get("/", response_model=List[solicitud_prestamo.SolicitudPrestamo])
def obtener_solicitudes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    solicitudes = db.query(models.SolicitudPrestamo).offset(skip).limit(limit).all()
    return solicitudes

@router.get("/revistas/", response_model=List[solicitud_prestamo.SolicitudRevistaDetalle])
def obtener_solicitudes_revistas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obtiene un listado de todas las solicitudes de revistas con el nombre del cliente,
    dirección particular y título del material.
    """
    solicitudes = (
        db.query(
            models.SolicitudPrestamo,
            models.Material.titulo
        )
        .join(models.Material)
        .filter(models.Material.tipo == "revista")
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        solicitud_prestamo.SolicitudRevistaDetalle(
            id=s.id,
            nombre_usuario=s.nombre_usuario,
            direccion_usuario=s.direccion_usuario,
            titulo_material=titulo,
            fecha_solicitud=s.fecha_solicitud,
            estado=s.estado,
            observaciones=s.observaciones
        )
        for s, titulo in solicitudes
    ]

@router.get("/{solicitud_id}", response_model=solicitud_prestamo.SolicitudPrestamo)
def obtener_solicitud(
    solicitud_id: int,
    db: Session = Depends(get_db)
):
    solicitud = db.query(models.SolicitudPrestamo).filter(models.SolicitudPrestamo.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitud no encontrada"
        )
    return solicitud

@router.put("/{solicitud_id}", response_model=solicitud_prestamo.SolicitudPrestamo)
@router.put("/{solicitud_id}", response_model=solicitud_prestamo.SolicitudPrestamo)
def actualizar_solicitud(
        solicitud_id: int,
        solicitud_update: solicitud_prestamo.SolicitudPrestamoUpdate,
        db: Session = Depends(get_db)
):
    db_solicitud = db.query(models.SolicitudPrestamo).filter(models.SolicitudPrestamo.id == solicitud_id).first()
    if not db_solicitud:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitud no encontrada"
        )

    # Si se aprueba la solicitud, crear un préstamo
    if solicitud_update.estado == "aprobada" and db_solicitud.estado != "aprobada":
        # Buscar al usuario por carne_identidad
        usuario = db.query(models.Usuario).filter(
            models.Usuario.carne_identidad == db_solicitud.carne_identidad).first()
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        # Verificar si el material existe y tiene disponibilidad
        material = db.query(models.Material).filter(models.Material.id == db_solicitud.material_id).first()
        if not material:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Material no encontrado"
            )
        if material.cantidad_prestamo >= material.cantidad_total:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay ejemplares disponibles para préstamo"
            )

        # Crear el préstamo
        db_prestamo = models.Prestamo(
            usuario_id=usuario.id,
            material_id=db_solicitud.material_id,
            estado="activo"
        )
        material.cantidad_prestamo += 1
        db.add(db_prestamo)

    # Actualizar los campos de la solicitud
    for key, value in solicitud_update.dict(exclude_unset=True).items():
        setattr(db_solicitud, key, value)

    db.commit()
    db.refresh(db_solicitud)
    return db_solicitud

@router.delete("/{solicitud_id}")
def eliminar_solicitud(
    solicitud_id: int,
    db: Session = Depends(get_db)
):
    db_solicitud = db.query(models.SolicitudPrestamo).filter(models.SolicitudPrestamo.id == solicitud_id).first()
    if not db_solicitud:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitud no encontrada"
        )
    
    db.delete(db_solicitud)
    db.commit()
    return {"message": "Solicitud eliminada correctamente"}

@router.get("/cliente/{carne_identidad}", response_model=List[solicitud_prestamo.SolicitudPrestamo])
def obtener_solicitudes_por_usuario(carne_identidad: str, db: Session = Depends(get_db)):
    """
    Obtiene todas las solicitudes de préstamo realizadas por un usuario específico
    identificado por su carné de identidad.
    """
    solicitudes = db.query(models.SolicitudPrestamo).filter(
        models.SolicitudPrestamo.carne_identidad == carne_identidad
    ).all()

    if not solicitudes:
        raise HTTPException(status_code=404, detail="No se encontraron solicitudes para este usuario.")

    return solicitudes