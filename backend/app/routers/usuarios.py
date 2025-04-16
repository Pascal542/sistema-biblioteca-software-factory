from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models
from ..schemas import usuario

router = APIRouter()

@router.post("/", response_model=usuario.Usuario)
def crear_usuario(usuario_data: usuario.UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = models.Usuario(**usuario_data.dict())
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.get("/", response_model=List[usuario.Usuario])
def obtener_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    usuarios = db.query(models.Usuario).offset(skip).limit(limit).all()
    return usuarios

@router.get("/{usuario_id}", response_model=usuario.Usuario)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_usuario

@router.put("/{usuario_id}", response_model=usuario.Usuario)
def actualizar_usuario(usuario_id: int, usuario_data: usuario.UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    for key, value in usuario_data.dict().items():
        setattr(db_usuario, key, value)
    
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.delete("/{usuario_id}")
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(db_usuario)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}
