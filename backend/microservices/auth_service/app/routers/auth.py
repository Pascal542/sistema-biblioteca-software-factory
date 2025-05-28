from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import logging
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.auth import Token
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.utils.security import verify_password, get_password_hash, create_access_token, authenticate_user, ACCESS_TOKEN_EXPIRE_MINUTES, hash_password, get_current_user

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
logger = logging.getLogger(__name__)

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
        data={"sub": user.email, "rol": user.rol, "nombre": user.nombre}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UsuarioCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(Usuario).filter(Usuario.email == user_data.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email ya registrado")

        # Verificar si el carné de identidad ya existe
        logger.info("🔍 Verificando si el carné de identidad ya existe...")
        db_user = db.query(Usuario).filter(Usuario.carne_identidad == user_data.carne_identidad).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Carné de identidad ya registrado")
        # Crear usuario
        hashed_password = hash_password(user_data.password)
        db_user = Usuario(
            nombre=user_data.nombre,
            carne_identidad=user_data.carne_identidad,
            direccion=user_data.direccion,
            email=user_data.email,
            hashed_password=hashed_password,
            rol="usuario",
            activo=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return {"message": "Usuario registrado exitosamente", "user_id": db_user.id}
        
    except HTTPException as he:
        db.rollback()
        raise
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e)
        raise HTTPException(status_code=400, detail="Error: datos duplicados o inválidos")
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {error_msg}")

@router.get("/me", response_model=UsuarioResponse)
def get_current_user_info(current_user: Usuario = Depends(get_current_user)):
    return current_user