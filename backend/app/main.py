from fastapi import FastAPI
from .database import engine, get_db
from . import models
from .initial_data import inicializar_datos
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Biblioteca")

# Inicializar datos
db = next(get_db())
try:
    # Verificar si ya hay datos
    if db.query(models.Usuario).count() == 0:
        inicializar_datos(db)
finally:
    db.close()

# Incluir los routers - importar después de inicializar datos
from .routers import usuarios_router, materiales_router, prestamos_router, solicitudes_prestamo_router, auth_router

app.include_router(usuarios_router, prefix="/api/usuarios", tags=["usuarios"])
app.include_router(materiales_router, prefix="/api/materiales", tags=["materiales"])
app.include_router(prestamos_router, prefix="/api/prestamos", tags=["prestamos"])
app.include_router(solicitudes_prestamo_router, prefix="/api/solicitudes", tags=["solicitudes"])
app.include_router(auth_router, prefix="/api/auth", tags=["autenticación"])

@app.get("/")
def read_root():
    return {"message": "Bienvenido al Sistema de Biblioteca"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)