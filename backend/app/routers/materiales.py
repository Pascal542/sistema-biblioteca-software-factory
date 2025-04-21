from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Union
from sqlalchemy import asc, func
from ..database import get_db
from .. import models
from ..schemas import material

router = APIRouter()

def calcular_y_agregar_factor_estancia(db_material: models.Material) -> material.Material:
    material_dict = db_material.__dict__
    material_dict['factor_estancia'] = db_material.calcular_factor_estancia()
    return material.Material(**material_dict)

@router.post("/libros/", response_model=material.Material)
def crear_libro(libro_data: material.LibroCreate, db: Session = Depends(get_db)):
    # Verificar si el identificador ya existe
    if db.query(models.Material).filter(models.Material.identificador == libro_data.identificador).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un material con este identificador"
        )
    
    db_libro = models.Libro(**libro_data.dict())
    db.add(db_libro)
    db.commit()
    db.refresh(db_libro)
    return calcular_y_agregar_factor_estancia(db_libro)

@router.post("/revistas/", response_model=material.Material)
def crear_revista(revista_data: material.RevistaCreate, db: Session = Depends(get_db)):
    # Verificar si el identificador ya existe
    if db.query(models.Material).filter(models.Material.identificador == revista_data.identificador).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un material con este identificador"
        )
    
    db_revista = models.Revista(**revista_data.dict())
    db.add(db_revista)
    db.commit()
    db.refresh(db_revista)
    return calcular_y_agregar_factor_estancia(db_revista)

@router.post("/actas/", response_model=material.Material)
def crear_acta(acta_data: material.ActaCongresoCreate, db: Session = Depends(get_db)):
    # Verificar si el identificador ya existe
    if db.query(models.Material).filter(models.Material.identificador == acta_data.identificador).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un material con este identificador"
        )
    
    db_acta = models.ActaCongreso(**acta_data.dict())
    db.add(db_acta)
    db.commit()
    db.refresh(db_acta)
    return calcular_y_agregar_factor_estancia(db_acta)

@router.get("/", response_model=dict)
def obtener_materiales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    total = db.query(models.Material).count()  # Total de materiales
    materiales = db.query(models.Material).offset(skip).limit(limit).all()
    return {
        "materials": [calcular_y_agregar_factor_estancia(m) for m in materiales],
        "total": total
    }

@router.get("/ordenados/", response_model=List[material.Material])
def obtener_materiales_ordenados(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Obtiene un listado de materiales ordenados por autor y título.
    """
    materiales = (
        db.query(models.Material)
        .order_by(asc(models.Material.autor), asc(models.Material.titulo))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [calcular_y_agregar_factor_estancia(m) for m in materiales]

@router.get("/disponibles", response_model=List[material.MaterialDisponible])
def obtener_materiales_disponibles(db: Session = Depends(get_db)):
    """
    Obtiene la cantidad de materiales disponibles por tipo en la biblioteca.
    Incluye el título de cada material.
    """
    # Obtener la cantidad total y en préstamo de cada tipo de material
    materiales_disponibles = []

    # Libros
    libros = db.query(
        models.Libro.id,
        models.Libro.titulo,
        models.Libro.autor,
        func.count(models.Libro.id).label('total'),
        func.sum(models.Libro.cantidad_prestamo).label('prestados')
    ).group_by(models.Libro.id, models.Libro.titulo, models.Libro.autor).all()
    
    for libro in libros:
        prestados = libro.prestados if libro.prestados is not None else 0
        disponibles = max(0, libro.total - prestados)
        materiales_disponibles.append(
            material.MaterialDisponible(
                id=libro.id,
                tipo="Libro",
                titulo=libro.titulo,
                cantidad_disponible=disponibles,
                cantidad_total=libro.total
            )
        )
    
    # Revistas
    revistas = db.query(
        models.Revista.id,
        models.Revista.titulo,
        models.Revista.autor,
        func.count(models.Revista.id).label('total'),
        func.sum(models.Revista.cantidad_prestamo).label('prestados')
    ).group_by(models.Revista.id, models.Revista.titulo, models.Revista.autor).all()
    
    for revista in revistas:
        prestados = revista.prestados if revista.prestados is not None else 0
        disponibles = max(0, revista.total - prestados)
        materiales_disponibles.append(
            material.MaterialDisponible(
                id=revista.id,
                tipo="Revista",
                titulo=revista.titulo,
                cantidad_disponible=disponibles,
                cantidad_total=revista.total
            )
        )
    
    # Actas de Congreso
    actas = db.query(
        models.ActaCongreso.id,
        models.ActaCongreso.titulo,
        models.ActaCongreso.autor,
        func.count(models.ActaCongreso.id).label('total'),
        func.sum(models.ActaCongreso.cantidad_prestamo).label('prestados')
    ).group_by(models.ActaCongreso.id, models.ActaCongreso.titulo, models.ActaCongreso.autor).all()
    
    for acta in actas:
        prestados = acta.prestados if acta.prestados is not None else 0
        disponibles = max(0, acta.total - prestados)
        materiales_disponibles.append(
            material.MaterialDisponible(
                id=acta.id,
                tipo="Acta de Congreso",
                titulo=acta.titulo,
                cantidad_disponible=disponibles,
                cantidad_total=acta.total
            )
        )
    
    return materiales_disponibles

@router.get("/en-prestamo", response_model=List[material.MaterialEnPrestamo])
def obtener_materiales_en_prestamo(db: Session = Depends(get_db)):
    """
    Obtiene un listado de todos los materiales que están actualmente en préstamo,
    ordenados por su factor de estancia de mayor a menor.
    Incluye el tipo, título, autor, cantidad prestada, fecha de préstamo y factor de estancia.
    """
    materiales_en_prestamo = []
    
    # Libros en préstamo
    libros = db.query(
        models.Libro.titulo,
        models.Libro.autor,
        models.Libro.cantidad_prestamo,
        models.Prestamo.fecha_prestamo
    ).join(
        models.Prestamo,
        models.Prestamo.material_id == models.Libro.id
    ).filter(
        models.Prestamo.estado == "activo"
    ).all()
    
    for libro in libros:
        if libro.cantidad_prestamo > 0:
            db_libro = db.query(models.Libro).filter(models.Libro.titulo == libro.titulo).first()
            factor_estancia = db_libro.calcular_factor_estancia() if db_libro else 0.0
            materiales_en_prestamo.append(
                material.MaterialEnPrestamo(
                    tipo="Libro",
                    titulo=libro.titulo,
                    autor=libro.autor,
                    cantidad_prestada=libro.cantidad_prestamo,
                    fecha_prestamo=libro.fecha_prestamo,
                    factor_estancia=factor_estancia
                )
            )
    
    # Revistas en préstamo
    revistas = db.query(
        models.Revista.titulo,
        models.Revista.autor,
        models.Revista.cantidad_prestamo,
        models.Prestamo.fecha_prestamo
    ).join(
        models.Prestamo,
        models.Prestamo.material_id == models.Revista.id
    ).filter(
        models.Prestamo.estado == "activo"
    ).all()
    
    for revista in revistas:
        if revista.cantidad_prestamo > 0:
            db_revista = db.query(models.Revista).filter(models.Revista.titulo == revista.titulo).first()
            factor_estancia = db_revista.calcular_factor_estancia() if db_revista else 0.0
            materiales_en_prestamo.append(
                material.MaterialEnPrestamo(
                    tipo="Revista",
                    titulo=revista.titulo,
                    autor=revista.autor,
                    cantidad_prestada=revista.cantidad_prestamo,
                    fecha_prestamo=revista.fecha_prestamo,
                    factor_estancia=factor_estancia
                )
            )
    
    # Actas de Congreso en préstamo
    actas = db.query(
        models.ActaCongreso.titulo,
        models.ActaCongreso.autor,
        models.ActaCongreso.cantidad_prestamo,
        models.Prestamo.fecha_prestamo
    ).join(
        models.Prestamo,
        models.Prestamo.material_id == models.ActaCongreso.id
    ).filter(
        models.Prestamo.estado == "activo"
    ).all()
    
    for acta in actas:
        if acta.cantidad_prestamo > 0:
            db_acta = db.query(models.ActaCongreso).filter(models.ActaCongreso.titulo == acta.titulo).first()
            factor_estancia = db_acta.calcular_factor_estancia() if db_acta else 0.0
            materiales_en_prestamo.append(
                material.MaterialEnPrestamo(
                    tipo="Acta de Congreso",
                    titulo=acta.titulo,
                    autor=acta.autor,
                    cantidad_prestada=acta.cantidad_prestamo,
                    fecha_prestamo=acta.fecha_prestamo,
                    factor_estancia=factor_estancia
                )
            )
    
    # Ordenar por factor de estancia de mayor a menor
    materiales_en_prestamo.sort(key=lambda x: x.factor_estancia, reverse=True)
    
    return materiales_en_prestamo


@router.get("/{material_id}", response_model=material.Material)
def obtener_material(material_id: int, db: Session = Depends(get_db)):
    # Intenta buscar en cada tipo de material específico
    material_result = None

    # Buscar en Libros
    db_libro = db.query(models.Libro).filter(models.Libro.id == material_id).first()
    if db_libro:
        material_result = db_libro

    # Buscar en Revistas si no se encontró en Libros
    if not material_result:
        db_revista = db.query(models.Revista).filter(models.Revista.id == material_id).first()
        if db_revista:
            material_result = db_revista

    # Buscar en Actas si no se encontró en los anteriores
    if not material_result:
        db_acta = db.query(models.ActaCongreso).filter(models.ActaCongreso.id == material_id).first()
        if db_acta:
            material_result = db_acta

    # Si no se encontró en ninguna tabla específica, buscar en la tabla base
    if not material_result:
        material_result = db.query(models.Material).filter(models.Material.id == material_id).first()

    if material_result is None:
        raise HTTPException(status_code=404, detail="Material no encontrado")

    return calcular_y_agregar_factor_estancia(material_result)

@router.put("/{material_id}", response_model=material.Material)
def actualizar_material(
    material_id: int, 
    material_data: Union[material.LibroCreate, material.RevistaCreate, material.ActaCongresoCreate],
    db: Session = Depends(get_db)
):
    db_material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if db_material is None:
        raise HTTPException(status_code=404, detail="Material no encontrado")
    
    # Verificar si el nuevo identificador ya existe
    if material_data.identificador != db_material.identificador:
        if db.query(models.Material).filter(models.Material.identificador == material_data.identificador).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un material con este identificador"
            )
    
    # Actualizar los campos
    for key, value in material_data.dict().items():
        setattr(db_material, key, value)
    
    db.commit()
    db.refresh(db_material)
    return calcular_y_agregar_factor_estancia(db_material)

@router.delete("/{material_id}")
def eliminar_material(material_id: int, db: Session = Depends(get_db)):
    db_material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if db_material is None:
        raise HTTPException(status_code=404, detail="Material no encontrado")
    
    # Verificar si el material está en préstamo
    if db_material.cantidad_prestamo > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar un material que está en préstamo"
        )
    
    db.delete(db_material)
    db.commit()
    return {"message": "Material eliminado correctamente"}


@router.get("/libros/", response_model=dict)
def obtener_libros(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Obtiene un listado de todos los libros disponibles en la biblioteca.
    """
    total = db.query(models.Libro).count()
    libros = db.query(models.Libro).offset(skip).limit(limit).all()

    result = []
    for libro in libros:
        libro_dict = calcular_y_agregar_factor_estancia(libro).__dict__
        libro_dict['genero'] = libro.genero
        result.append(libro_dict)

    return {
        "materials": result,
        "total": total
    }


@router.get("/revistas/", response_model=dict)
def obtener_revistas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Obtiene un listado de todas las revistas disponibles en la biblioteca.
    """
    total = db.query(models.Revista).count()
    revistas = db.query(models.Revista).offset(skip).limit(limit).all()

    result = []
    for revista in revistas:
        revista_dict = calcular_y_agregar_factor_estancia(revista).__dict__
        revista_dict['frecuencia_publicacion'] = revista.frecuencia_publicacion
        result.append(revista_dict)

    return {
        "materials": result,
        "total": total
    }


@router.get("/actas/", response_model=dict)
def obtener_actas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Obtiene un listado de todas las actas de congreso disponibles en la biblioteca.
    """
    total = db.query(models.ActaCongreso).count()
    actas = db.query(models.ActaCongreso).offset(skip).limit(limit).all()

    result = []
    for acta in actas:
        acta_dict = calcular_y_agregar_factor_estancia(acta).__dict__
        acta_dict['nombre_congreso'] = acta.nombre_congreso
        result.append(acta_dict)

    return {
        "materials": result,
        "total": total
    }