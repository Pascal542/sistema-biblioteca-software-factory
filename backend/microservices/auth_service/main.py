from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.routers import auth, usuarios
from app.database import engine, Base

# Crear tablas en la base de datos
try:
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas exitosamente")
except Exception as e:
    print(f"Error al crear tablas: {e}")

app = FastAPI(title="Auth Service")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, tags=['Authentication'])
app.include_router(usuarios.router, prefix="/usuarios", tags=['Users'])

@app.get("/")
def read_root():
    return {"message": "Welcome to Auth Service"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)