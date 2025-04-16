from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Union
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
    db_libro = models.Libro(**libro_data.dict())
    db.add(db_libro)
    db.commit()
    db.refresh(db_libro)
    return calcular_y_agregar_factor_estancia(db_libro)

@router.post("/revistas/", response_model=material.Material)
def crear_revista(revista_data: material.RevistaCreate, db: Session = Depends(get_db)):
    db_revista = models.Revista(**revista_data.dict())
    db.add(db_revista)
    db.commit()
    db.refresh(db_revista)
    return calcular_y_agregar_factor_estancia(db_revista)

@router.post("/actas/", response_model=material.Material)
def crear_acta(acta_data: material.ActaCongresoCreate, db: Session = Depends(get_db)):
    db_acta = models.ActaCongreso(**acta_data.dict())
    db.add(db_acta)
    db.commit()
    db.refresh(db_acta)
    return calcular_y_agregar_factor_estancia(db_acta)

@router.get("/", response_model=List[material.Material])
def obtener_materiales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    materiales = db.query(models.Material).offset(skip).limit(limit).all()
    return [calcular_y_agregar_factor_estancia(m) for m in materiales]

@router.get("/{material_id}", response_model=material.Material)
def obtener_material(material_id: int, db: Session = Depends(get_db)):
    db_material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if db_material is None:
        raise HTTPException(status_code=404, detail="Material no encontrado")
    return calcular_y_agregar_factor_estancia(db_material)

@router.put("/{material_id}", response_model=material.Material)
def actualizar_material(material_id: int, material_data: Union[material.LibroCreate, material.RevistaCreate, material.ActaCongresoCreate], db: Session = Depends(get_db)):
    db_material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if db_material is None:
        raise HTTPException(status_code=404, detail="Material no encontrado")
    
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
    
    db.delete(db_material)
    db.commit()
    return {"message": "Material eliminado correctamente"}
