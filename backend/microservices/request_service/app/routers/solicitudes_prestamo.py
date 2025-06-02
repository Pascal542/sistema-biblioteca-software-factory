from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import httpx
import os
from pydantic import BaseModel

from app.database import get_db
from app.models.solicitud_prestamo import SolicitudPrestamo
from app.schemas.solicitud_prestamo import SolicitudPrestamoCreate, SolicitudPrestamoResponse, SolicitudPrestamoUpdate

router = APIRouter()

# URLs de los servicios
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
MATERIAL_SERVICE_URL = os.getenv("MATERIAL_SERVICE_URL", "http://localhost:8002")
LOAN_SERVICE_URL = os.getenv("LOAN_SERVICE_URL", "http://localhost:8003")

# Esquemas para paginación
class PaginationInfo(BaseModel):
    total: int
    page: int
    size: int
    pages: int

class PaginatedSolicitudResponse(BaseModel):
    data: List[SolicitudPrestamoResponse]
    pagination: PaginationInfo

# Esquema adicional para solicitudes de revistas
class SolicitudRevistaDetalle(BaseModel):
    id: int
    nombre_usuario: str
    direccion_usuario: str
    titulo_material: str
    fecha_solicitud: datetime
    estado: str
    observaciones: Optional[str] = None
    
    class Config:
        from_attributes = True

class PaginatedSolicitudRevistaResponse(BaseModel):
    data: List[SolicitudRevistaDetalle]
    pagination: PaginationInfo

# Funciones auxiliares para comunicación con otros servicios
async def verificar_usuario(usuario_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AUTH_SERVICE_URL}/usuarios/{usuario_id}")
            if response.status_code != 200:
                return False, None
            return True, response.json()
        except httpx.RequestError:
            return False, None

async def verificar_usuario_por_dni(dni: str):
    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            # Llamar directamente al servicio de usuarios sin el API Gateway
            direct_url = f"{AUTH_SERVICE_URL}/usuarios"
            
            response = await client.get(direct_url)
            
            # Si aún hay redirect, intentar con la ruta del API Gateway
            if response.status_code == 307:
                gateway_url = f"{AUTH_SERVICE_URL}/api/usuarios"
                response = await client.get(gateway_url)
            
            if response.status_code != 200:
                return False, None
            
            usuarios = response.json()
            
            for usuario in usuarios:
                if usuario.get("carne_identidad") == str(dni):
                    return True, usuario
            
            return False, None
        except httpx.RequestError:
            return False, None
        except Exception:
            return False, None

async def verificar_material(material_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{MATERIAL_SERVICE_URL}/materiales/{material_id}")
            if response.status_code != 200:
                return False, None
            material_data = response.json()
            return True, material_data
        except httpx.RequestError:
            return False, None

async def crear_prestamo(usuario_id: int, material_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{LOAN_SERVICE_URL}/prestamos",
                json={
                    "usuario_id": usuario_id,
                    "material_id": material_id
                }
            )
            return response.status_code == 200 or response.status_code == 201, response.json() if response.status_code in [200, 201] else None
        except httpx.RequestError as e:
            print(f"Error al crear préstamo: {e}")
            return False, None

async def actualizar_cantidad_material(material_id: int, nueva_cantidad: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(
                f"{MATERIAL_SERVICE_URL}/materiales/{material_id}",
                json={"cantidad": nueva_cantidad}
            )
            return response.status_code == 200, response.json() if response.status_code == 200 else None
        except httpx.RequestError:
            return False, None

async def actualizar_material_completo(material_id: int, nueva_cantidad: int, nuevo_estado: str):
    """Actualiza tanto la cantidad como el estado de un material"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(
                f"{MATERIAL_SERVICE_URL}/materiales/{material_id}",
                json={
                    "cantidad": nueva_cantidad,
                    "estado": nuevo_estado
                }
            )
            return response.status_code == 200, response.json() if response.status_code == 200 else None
        except httpx.RequestError as e:
            print(f"Error al actualizar material: {e}")
            return False, None


@router.post("/", response_model=SolicitudPrestamoResponse)
async def crear_solicitud_prestamo(solicitud: SolicitudPrestamoCreate, db: Session = Depends(get_db)):
    # Verificar que el usuario existe
    usuario_existe, usuario_data = await verificar_usuario(solicitud.usuario_id)
    if not usuario_existe:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Verificar que el material existe
    material_existe, material_data = await verificar_material(solicitud.material_id)
    if not material_existe:
        raise HTTPException(status_code=404, detail="Material no encontrado")
    
    # Verificar si el material está disponible
    if material_data["estado"] != "disponible":
        raise HTTPException(status_code=400, detail="El material no está disponible para préstamo")
    
    # Crear la solicitud
    db_solicitud = SolicitudPrestamo(
        usuario_id=solicitud.usuario_id,
        material_id=solicitud.material_id,
        estado="pendiente",
        observaciones=solicitud.observaciones
    )

    # Calcular nueva cantidad (restar 1)
    nueva_cantidad = material_data["cantidad"] - 1
    
    # Actualizar el estado del material si la cantidad llega a 0
    estado_material = "no disponible" if nueva_cantidad == 0 else "disponible"
    
    # Actualizar la cantidad y estado del material
    material_actualizado, _ = await actualizar_material_completo(
        solicitud.material_id, 
        nueva_cantidad, 
        estado_material
    )
    
    if not material_actualizado:
        raise HTTPException(
            status_code=500, 
            detail="Error al actualizar la cantidad del material"
        )
    
    # Crear la solicitud con estado "Aprobada" automáticamente
    db_solicitud = SolicitudPrestamo(
        usuario_id=solicitud.usuario_id,
        material_id=solicitud.material_id,
        estado="pendiente",
        observaciones=solicitud.observaciones
    )
    
    db.add(db_solicitud)
    db.commit()
    db.refresh(db_solicitud)
    
    return db_solicitud

@router.get("/", response_model=PaginatedSolicitudResponse)
def obtener_solicitudes(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista paginada de solicitudes con filtro opcional por estado.
    """
    # Calcular offset
    skip = (page - 1) * size
    
    # Query base
    query = db.query(SolicitudPrestamo).filter(SolicitudPrestamo.activo == True)
    
    # Aplicar filtro por estado si se proporciona
    if estado:
        query = query.filter(SolicitudPrestamo.estado == estado)
    
    # Obtener el total de registros
    total = query.count()
    
    # Obtener resultados paginados
    solicitudes = query.offset(skip).limit(size).all()
    
    # Calcular páginas
    pages = (total + size - 1) // size if total > 0 else 1
    
    return PaginatedSolicitudResponse(
        data=solicitudes,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

@router.get("/{solicitud_id}", response_model=SolicitudPrestamoResponse)
def obtener_solicitud(solicitud_id: int, db: Session = Depends(get_db)):
    solicitud = db.query(SolicitudPrestamo).filter(
        SolicitudPrestamo.id == solicitud_id,
        SolicitudPrestamo.activo == True
    ).first()
    if not solicitud:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitud no encontrada"
        )
    return solicitud

@router.get("/usuario-dni/{dni}", response_model=PaginatedSolicitudResponse)
async def obtener_solicitudes_por_dni(
    dni: str,
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las solicitudes de préstamo realizadas por un usuario identificado por su DNI con paginación.
    """
    usuario_existe, usuario_data = await verificar_usuario_por_dni(dni)
    
    if not usuario_existe:
        return PaginatedSolicitudResponse(
            data=[],
            pagination=PaginationInfo(
                total=0,
                page=page,
                size=size,
                pages=1
            )
        )

    skip = (page - 1) * size

    # Query base
    query = db.query(SolicitudPrestamo).filter(
        SolicitudPrestamo.usuario_id == usuario_data["id"],
        SolicitudPrestamo.activo == True
    )

    total = query.count()
    solicitudes = query.offset(skip).limit(size).all()
    pages = (total + size - 1) // size if total > 0 else 1

    return PaginatedSolicitudResponse(
        data=solicitudes,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

@router.get("/estado/{estado}", response_model=PaginatedSolicitudResponse)
def obtener_solicitudes_por_estado(
    estado: str,
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las solicitudes filtradas por estado con paginación.
    """
    # Calcular offset
    skip = (page - 1) * size
    
    # Query base
    query = db.query(SolicitudPrestamo).filter(
        SolicitudPrestamo.estado == estado,
        SolicitudPrestamo.activo == True
    )
    
    # Obtener el total de registros
    total = query.count()
    
    # Obtener resultados paginados
    solicitudes = query.offset(skip).limit(size).all()
    
    # Calcular páginas
    pages = (total + size - 1) // size if total > 0 else 1
    
    return PaginatedSolicitudResponse(
        data=solicitudes,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

@router.put("/{solicitud_id}", response_model=SolicitudPrestamoResponse)
async def actualizar_solicitud(
    solicitud_id: int,
    solicitud_update: SolicitudPrestamoUpdate,
    db: Session = Depends(get_db)
):
    db_solicitud = db.query(SolicitudPrestamo).filter(
        SolicitudPrestamo.id == solicitud_id,
        SolicitudPrestamo.activo == True
    ).first()
    if not db_solicitud:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitud no encontrada"
        )

    # Si se rechaza la solicitud, devolver la cantidad al material
    if solicitud_update.estado == "rechazada" and db_solicitud.estado == "pendiente":
        # Obtener información actual del material
        material_existe, material_data = await verificar_material(db_solicitud.material_id)
        if material_existe:
            # Calcular nueva cantidad (sumar 1)
            nueva_cantidad = material_data["cantidad"] + 1
            
            # Actualizar el estado del material a disponible cuando se devuelve
            estado_material = "disponible"
            
            # Actualizar la cantidad y estado del material
            material_actualizado, _ = await actualizar_material_completo(
                db_solicitud.material_id, 
                nueva_cantidad, 
                estado_material
            )
            
            if not material_actualizado:
                raise HTTPException(
                    status_code=500, 
                    detail="Error al actualizar la cantidad del material al rechazar la solicitud"
                )

    # Si se aprueba la solicitud, crear un préstamo
    if solicitud_update.estado == "Aprobada" and db_solicitud.estado != "Aprobada":
        # Verificar si el usuario existe
        usuario_existe, _ = await verificar_usuario(db_solicitud.usuario_id)
        if not usuario_existe:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        # Verificar si el material existe
        material_existe, material_data = await verificar_material(db_solicitud.material_id)
        if not material_existe:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Material no encontrado"
            )

        # Crear el préstamo a través del servicio de préstamos
        prestamo_creado, _ = await crear_prestamo(
            db_solicitud.usuario_id, 
            db_solicitud.material_id
        )
        
        if not prestamo_creado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo crear el préstamo"
            )
        

    # Actualizar los campos de la solicitud
    for key, value in solicitud_update.dict(exclude_unset=True).items():
        setattr(db_solicitud, key, value)

    db.commit()
    db.refresh(db_solicitud)
    return db_solicitud

@router.delete("/{solicitud_id}")
def eliminar_solicitud(solicitud_id: int, db: Session = Depends(get_db)):
    db_solicitud = db.query(SolicitudPrestamo).filter(
        SolicitudPrestamo.id == solicitud_id,
        SolicitudPrestamo.activo == True
    ).first()
    if not db_solicitud:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitud no encontrada"
        )
    
    # Soft delete - marcar como inactivo en lugar de eliminar
    db_solicitud.activo = False
    db.commit()
    
    return {"message": "Solicitud eliminada correctamente"}

@router.get("/revistas/detalles", response_model=PaginatedSolicitudRevistaResponse)
async def obtener_solicitudes_revistas_con_detalles(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    db: Session = Depends(get_db)
):
    """
    Obtiene un listado paginado de solicitudes de revistas con detalles adicionales
    del usuario y del material obtenidos de sus respectivos microservicios.
    """
    # Calcular offset
    skip = (page - 1) * size
    
    # Obtener el total de solicitudes activas
    total_solicitudes = db.query(func.count(SolicitudPrestamo.id)).filter(
        SolicitudPrestamo.activo == True
    ).scalar()
    
    # Obtener solicitudes paginadas
    solicitudes = db.query(SolicitudPrestamo).filter(
        SolicitudPrestamo.activo == True
    ).offset(skip).limit(size).all()
    
    # Enriquecer cada solicitud con la información de usuario y material
    resultado = []
    for solicitud in solicitudes:
        # Obtener información del usuario
        usuario_existe, usuario_data = await verificar_usuario(solicitud.usuario_id)
        if not usuario_existe:
            continue
        
        # Obtener información del material
        material_existe, material_data = await verificar_material(solicitud.material_id)
        if not material_existe:
            continue
        
        # Solo incluir revistas
        if material_data["tipo"] != "Revista":
            continue
        
        # Combinar la información
        resultado.append(
            SolicitudRevistaDetalle(
                id=solicitud.id,
                nombre_usuario=f"{usuario_data['nombres']} {usuario_data['apellidos']}",
                direccion_usuario=usuario_data.get("direccion", "No registrada"),
                titulo_material=material_data["titulo"],
                fecha_solicitud=solicitud.fecha_solicitud,
                estado=solicitud.estado,
                observaciones=getattr(solicitud, "observaciones", None)
            )
        )
    
    # Calcular páginas basado en el total real de revistas encontradas
    total_revistas = len(resultado)
    pages = (total_revistas + size - 1) // size if total_revistas > 0 else 1
    
    return PaginatedSolicitudRevistaResponse(
        data=resultado,
        pagination=PaginationInfo(
            total=total_revistas,
            page=page,
            size=size,
            pages=pages
        )
    )

# Endpoint adicional para obtener estadísticas de solicitudes
@router.get("/estadisticas/resumen")
def obtener_estadisticas_solicitudes(db: Session = Depends(get_db)):
    """
    Obtiene estadísticas resumidas de las solicitudes.
    """
    total_solicitudes = db.query(func.count(SolicitudPrestamo.id)).filter(
        SolicitudPrestamo.activo == True
    ).scalar()
    
    solicitudes_pendientes = db.query(func.count(SolicitudPrestamo.id)).filter(
        SolicitudPrestamo.estado == "pendiente",
        SolicitudPrestamo.activo == True
    ).scalar()
    
    solicitudes_aprobadas = db.query(func.count(SolicitudPrestamo.id)).filter(
        SolicitudPrestamo.estado == "aprobada",
        SolicitudPrestamo.activo == True
    ).scalar()
    
    solicitudes_rechazadas = db.query(func.count(SolicitudPrestamo.id)).filter(
        SolicitudPrestamo.estado == "rechazada",
        SolicitudPrestamo.activo == True
    ).scalar()
    
    return {
        "total_solicitudes": total_solicitudes,
        "solicitudes_pendientes": solicitudes_pendientes,
        "solicitudes_aprobadas": solicitudes_aprobadas,
        "solicitudes_rechazadas": solicitudes_rechazadas
    }