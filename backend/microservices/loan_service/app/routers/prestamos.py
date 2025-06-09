from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
import httpx
import os
from pydantic import BaseModel

from app.database import get_db
from app.models.prestamo import Prestamo
from app.schemas.prestamo import PrestamoCreate, PrestamoResponse, PrestamoUpdate
BACKEND_URL = "http://192.168.1.200"
# BACKEND_URL = "http://localhost"

router = APIRouter()

# URLs de los servicios
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", f'{BACKEND_URL}:8001')
MATERIAL_SERVICE_URL = os.getenv("MATERIAL_SERVICE_URL", f'{BACKEND_URL}:8002')

# Esquemas para paginación
class PaginationInfo(BaseModel):
    total: int
    page: int
    size: int
    pages: int

class PaginatedPrestamoResponse(BaseModel):
    data: List[PrestamoResponse]
    pagination: PaginationInfo

class PaginatedMaterialPrestadoResponse(BaseModel):
    data: List['MaterialPrestado']
    pagination: PaginationInfo

# Esquema para material prestado (respuesta específica)
class MaterialPrestado(BaseModel):
    titulo: str
    autor: str
    fecha_prestamo: datetime
    estado: str

# Esquema para préstamo con detalles del material (respuesta específica para cliente)
class PrestamoConDetalles(BaseModel):
    id: int
    material_id: int
    titulo: str
    autor: str
    fecha_prestamo: datetime
    fecha_limite: datetime
    fecha_devolucion: Optional[datetime] = None
    estado: str

class PaginatedPrestamoConDetallesResponse(BaseModel):
    data: List[PrestamoConDetalles]
    pagination: PaginationInfo

# Nueva clase para materiales en préstamo
class MaterialEnPrestamo(BaseModel):
    tipo: str
    titulo: str
    autor: str
    cantidad_prestada: int
    fecha_prestamo: datetime
    factor_estancia: float

# Verificar usuario y material usando solicitudes HTTP a los microservicios
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
    async with httpx.AsyncClient() as client:
        try:
            # Buscar todos los usuarios y filtrar por DNI
            response = await client.get(f"{AUTH_SERVICE_URL}/usuarios")
            if response.status_code != 200:
                return False, None
            
            usuarios = response.json()
            for usuario in usuarios:
                if usuario.get("dni") == dni:
                    return True, usuario
            
            return False, None
        except httpx.RequestError:
            return False, None

async def obtener_material(material_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{MATERIAL_SERVICE_URL}/materiales/{material_id}")
            if response.status_code != 200:
                return False, None
            return True, response.json()
        except httpx.RequestError:
            return False, None

async def actualizar_estado_material(material_id: int, nuevo_estado: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(
                f"{MATERIAL_SERVICE_URL}/materiales/{material_id}",
                json={"estado": nuevo_estado}
            )
            return response.status_code == 200
        except httpx.RequestError:
            return False

@router.post("/", response_model=PrestamoResponse)
async def crear_prestamo(prestamo: PrestamoCreate, db: Session = Depends(get_db)):
    # Verificar que el usuario existe
    usuario_existe, _ = await verificar_usuario(prestamo.usuario_id)
    if not usuario_existe:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Verificar que el material existe y está disponible
    material_existe, material_data = await obtener_material(prestamo.material_id)
    if not material_existe:
        raise HTTPException(status_code=404, detail="Material no encontrado")
    
    if material_data["estado"] != "disponible":
        raise HTTPException(status_code=400, detail="Material no disponible para préstamo")
    
    # Calcular fecha de devolución esperada (ejemplo: 7 días)
    fecha_devolucion = datetime.now() + timedelta(days=7)
    
    # Crear el préstamo
    db_prestamo = Prestamo(
        usuario_id=prestamo.usuario_id,
        material_id=prestamo.material_id,
        fecha_devolucion_esperada=fecha_devolucion,
        estado="Activo"
    )
    
    db.add(db_prestamo)
    db.commit()
    db.refresh(db_prestamo)

    return db_prestamo

@router.get("/", response_model=PaginatedPrestamoResponse)
def obtener_prestamos(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista paginada de préstamos.
    """
    # Calcular el offset
    skip = (page - 1) * size
    
    # Obtener el total de préstamos
    total = db.query(func.count(Prestamo.id)).scalar()
    
    # Obtener los préstamos paginados
    prestamos = db.query(Prestamo).offset(skip).limit(size).all()
    
    # Calcular el número total de páginas
    pages = (total + size - 1) // size if total > 0 else 1
    
    return PaginatedPrestamoResponse(
        data=prestamos,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

@router.get("/{prestamo_id}", response_model=PrestamoResponse)
def obtener_prestamo(prestamo_id: int, db: Session = Depends(get_db)):
    db_prestamo = db.query(Prestamo).filter(Prestamo.id == prestamo_id).first()
    if db_prestamo is None:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    return db_prestamo

@router.put("/{prestamo_id}", response_model=PrestamoResponse)
async def actualizar_prestamo(
    prestamo_id: int,
    prestamo_update: PrestamoUpdate,
    db: Session = Depends(get_db)
):
    db_prestamo = db.query(Prestamo).filter(Prestamo.id == prestamo_id).first()
    if db_prestamo is None:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    
    # Si se está marcando como devuelto
    if prestamo_update.estado == "Devuelto" and db_prestamo.estado != "Devuelto":
        # Actualizar el estado del material a "Disponible"
        actualizado = await actualizar_estado_material(db_prestamo.material_id, "disponible")
        if not actualizado:
            raise HTTPException(status_code=500, detail="Error al actualizar el estado del material")
        
        # Establecer la fecha de devolución real
        prestamo_update.fecha_devolucion_real = datetime.now()
    
    # Actualizar los campos del préstamo
    update_data = prestamo_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:  # Solo actualizar campos que no son None
            setattr(db_prestamo, key, value)
    
    db.commit()
    db.refresh(db_prestamo)
    return db_prestamo

@router.delete("/{prestamo_id}")
async def eliminar_prestamo(prestamo_id: int, db: Session = Depends(get_db)):
    db_prestamo = db.query(Prestamo).filter(Prestamo.id == prestamo_id).first()
    if db_prestamo is None:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    
    # Si el préstamo está activo, actualizar el estado del material
    if db_prestamo.estado == "Activo":
        await actualizar_estado_material(db_prestamo.material_id, "disponible")
    
    # Soft delete - marcar como inactivo en lugar de eliminar
    db_prestamo.activo = False
    db.commit()
    return {"message": "Préstamo eliminado correctamente"}

@router.get("/usuario/{dni}", response_model=PaginatedMaterialPrestadoResponse)
async def obtener_materiales_prestados_por_dni(
    dni: str,
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista paginada de materiales prestados a un usuario específico por su DNI.
    Incluye el título y autor de cada material, así como la fecha de préstamo y estado.
    """
    # Buscar el usuario por DNI
    usuario_existe, usuario_data = await verificar_usuario_por_dni(dni)
    if not usuario_existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Calcular offset
    skip = (page - 1) * size
    
    # Obtener el total de préstamos activos del usuario
    total = db.query(func.count(Prestamo.id)).filter(
        Prestamo.usuario_id == usuario_data["id"],
        Prestamo.estado == "Activo"
    ).scalar()
    
    # Obtener los préstamos activos del usuario con paginación
    prestamos = db.query(Prestamo).filter(
        Prestamo.usuario_id == usuario_data["id"],
        Prestamo.estado == "Activo"
    ).offset(skip).limit(size).all()
    
    # Obtener información de los materiales
    resultado = []
    for p in prestamos:
        material_existe, material_data = await obtener_material(p.material_id)
        if material_existe:
            resultado.append(
                MaterialPrestado(
                    titulo=material_data["titulo"],
                    autor=material_data["autor"],
                    fecha_prestamo=p.fecha_prestamo,
                    estado=p.estado
                )
            )
    
    # Calcular páginas
    pages = (total + size - 1) // size if total > 0 else 1
    
    return PaginatedMaterialPrestadoResponse(
        data=resultado,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

# Endpoint adicional para obtener préstamos por estado con paginación
@router.get("/estado/{estado}", response_model=PaginatedPrestamoResponse)
def obtener_prestamos_por_estado(
    estado: str,
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista paginada de préstamos filtrados por estado.
    """
    # Calcular offset
    skip = (page - 1) * size
    
    # Obtener el total de préstamos con el estado específico
    total = db.query(func.count(Prestamo.id)).filter(Prestamo.estado == estado).scalar()
    
    # Obtener los préstamos paginados
    prestamos = db.query(Prestamo).filter(Prestamo.estado == estado).offset(skip).limit(size).all()
    
    # Calcular páginas
    pages = (total + size - 1) // size if total > 0 else 1
    
    return PaginatedPrestamoResponse(
        data=prestamos,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

# Endpoint para obtener préstamos vencidos con paginación
@router.get("/vencidos/list", response_model=PaginatedPrestamoResponse)
def obtener_prestamos_vencidos(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista paginada de préstamos vencidos (fecha de devolución esperada pasada).
    """
    # Calcular offset
    skip = (page - 1) * size
    
    # Obtener el total de préstamos vencidos
    total = db.query(func.count(Prestamo.id)).filter(
        Prestamo.fecha_devolucion_esperada < datetime.now(),
        Prestamo.estado == "Activo"
    ).scalar()
    
    # Obtener los préstamos vencidos paginados
    prestamos = db.query(Prestamo).filter(
        Prestamo.fecha_devolucion_esperada < datetime.now(),
        Prestamo.estado == "Activo"
    ).offset(skip).limit(size).all()
    
    # Calcular páginas
    pages = (total + size - 1) // size if total > 0 else 1
    
    return PaginatedPrestamoResponse(
        data=prestamos,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

# Endpoint para obtener préstamos por ID de usuario con detalles del material
@router.get("/usuario/{usuario_id}/detalles", response_model=PaginatedPrestamoConDetallesResponse)
async def obtener_prestamos_por_usuario_con_detalles(
    usuario_id: int,
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Cantidad de elementos por página"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista paginada de préstamos realizados por un usuario específico,
    incluyendo detalles del material (título, autor) y estado del préstamo.
    """
    # Calcular offset
    skip = (page - 1) * size
    
    # Obtener el total de préstamos del usuario
    total = db.query(func.count(Prestamo.id)).filter(Prestamo.usuario_id == usuario_id).scalar()
    
    # Obtener los préstamos del usuario con paginación
    prestamos = db.query(Prestamo).filter(Prestamo.usuario_id == usuario_id).offset(skip).limit(size).all()
    
    # Obtener detalles de cada préstamo
    resultado = []
    for p in prestamos:
        material_existe, material_data = await obtener_material(p.material_id)
        if material_existe:            resultado.append(
                PrestamoConDetalles(
                    id=p.id,
                    material_id=p.material_id,
                    titulo=material_data["titulo"],
                    autor=material_data["autor"],
                    fecha_prestamo=p.fecha_prestamo,
                    fecha_limite=p.fecha_devolucion_esperada,
                    fecha_devolucion=p.fecha_devolucion_real,
                    estado=p.estado
                )
            )
    
    # Calcular páginas
    pages = (total + size - 1) // size if total > 0 else 1
    
    return PaginatedPrestamoConDetallesResponse(
        data=resultado,
        pagination=PaginationInfo(
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    )

# Endpoint para obtener préstamos por ID de usuario (endpoint compatible con frontend)
@router.get("/cliente/{usuario_id}", response_model=List[PrestamoConDetalles])
async def obtener_prestamos_cliente(
    usuario_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los préstamos realizados por un usuario específico,
    incluyendo detalles del material. Endpoint compatible con ClientLoans frontend.
    """
    # Obtener todos los préstamos del usuario
    prestamos = db.query(Prestamo).filter(Prestamo.usuario_id == usuario_id).all()
    
    # Obtener detalles de cada préstamo
    resultado = []
    for p in prestamos:
        material_existe, material_data = await obtener_material(p.material_id)
        if material_existe:            resultado.append(
                PrestamoConDetalles(
                    id=p.id,
                    material_id=p.material_id,
                    titulo=material_data["titulo"],
                    autor=material_data["autor"],
                    fecha_prestamo=p.fecha_prestamo,
                    fecha_limite=p.fecha_devolucion_esperada,
                    fecha_devolucion=p.fecha_devolucion_real,
                    estado=p.estado.lower() if p.estado else "activo"
                )
            )
    
    return resultado

@router.get("/materiales/en-prestamo", response_model=List[MaterialEnPrestamo])
async def obtener_materiales_en_prestamo(db: Session = Depends(get_db)):
    """
    Obtiene todos los materiales que están actualmente en préstamo
    con información detallada del material y tiempo de préstamo.
    """
    # Obtener todos los préstamos activos
    prestamos_activos = db.query(Prestamo).filter(Prestamo.estado == "Activo").all()
    
    # Dictionary to group by material_id and count loans
    materiales_agrupados = {}
    
    for prestamo in prestamos_activos:
        material_id = prestamo.material_id
        if material_id not in materiales_agrupados:
            materiales_agrupados[material_id] = {
                'prestamos': [],
                'cantidad': 0
            }
        materiales_agrupados[material_id]['prestamos'].append(prestamo)
        materiales_agrupados[material_id]['cantidad'] += 1
    
    # Get material details and build response
    resultado = []
    for material_id, data in materiales_agrupados.items():
        material_existe, material_data = await obtener_material(material_id)
        if material_existe:
            # Calculate average stay factor (days since loan)
            total_dias = 0
            for prestamo in data['prestamos']:
                dias_prestamo = (datetime.now() - prestamo.fecha_prestamo).days
                total_dias += dias_prestamo
            
            factor_estancia = total_dias / len(data['prestamos']) if data['prestamos'] else 0
            
            # Get the most recent loan date
            fecha_prestamo_reciente = max(p.fecha_prestamo for p in data['prestamos'])
            
            resultado.append(
                MaterialEnPrestamo(
                    tipo=material_data.get("tipo", "No especificado"),
                    titulo=material_data["titulo"],
                    autor=material_data["autor"],
                    cantidad_prestada=data['cantidad'],
                    fecha_prestamo=fecha_prestamo_reciente,
                    factor_estancia=factor_estancia
                )
            )
    
    return resultado