from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import hashlib
from jose import jwt, JWTError
from datetime import datetime

from ..database import get_db
from .. import models
from ..schemas import usuario
from ..utils.security import authenticate_user, create_access_token, hash_password, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user

router = APIRouter()

@router.post("/login", response_model=dict)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "rol": user.rol}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: usuario.UsuarioCreate, db: Session = Depends(get_db)):
    # Verificar si el email ya existe
    db_user = db.query(models.Usuario).filter(models.Usuario.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    # Verificar si el carné ya existe
    db_user = db.query(models.Usuario).filter(models.Usuario.carne_identidad == user_data.carne_identidad).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Carné de identidad ya registrado")

    # Crear usuario
    hashed_password = hash_password(user_data.password)
    db_user = models.Usuario(
        nombre=user_data.nombre,
        carne_identidad=user_data.carne_identidad,
        direccion=user_data.direccion,
        email=user_data.email,
        password_hash=hashed_password,
        rol=models.RolUsuario.USUARIO  # Por defecto es usuario normal
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "Usuario registrado exitosamente"}

@router.get("/me", response_model=usuario.Usuario)
def get_current_user_info(current_user: models.Usuario = Depends(get_current_user)):
    return current_user