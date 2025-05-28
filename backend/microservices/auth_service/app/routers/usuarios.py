from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from app.utils.security import get_password_hash

router = APIRouter()

@router.post("/", response_model=UsuarioResponse)
def crear_usuario(usuario_data: UsuarioCreate, db: Session = Depends(get_db)):
    # Verificar si el usuario ya existe
    db_usuario_existente = db.query(Usuario).filter(Usuario.email == usuario_data.email).first()
    if db_usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Crear hash de la contraseña
    hashed_password = get_password_hash(usuario_data.password)
    
    # Preparar datos del usuario
    usuario_dict = usuario_data.dict()
    usuario_dict.pop("password")
    
    # Crear el usuario en la BD
    db_usuario = Usuario(hashed_password=hashed_password, **usuario_dict)
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.get("/", response_model=List[UsuarioResponse])
def obtener_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    usuarios = db.query(Usuario).offset(skip).limit(limit).all()
    return usuarios

@router.get("/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_usuario

@router.put("/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(usuario_id: int, usuario_data: UsuarioUpdate, db: Session = Depends(get_db)):
    db_usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Actualizar campos
    update_data = usuario_data.dict(exclude_unset=True)
    
    # Si se envía una contraseña, hay que cifrarla
    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = get_password_hash(update_data["password"])
        del update_data["password"]
    
    for key, value in update_data.items():
        if value is not None:  # Solo actualizar campos que no son None
            setattr(db_usuario, key, value)
    
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.delete("/{usuario_id}")
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # En lugar de eliminar, marcar como inactivo (soft delete)
    db_usuario.activo = False
    db.commit()
    return {"message": "Usuario eliminado correctamente"}