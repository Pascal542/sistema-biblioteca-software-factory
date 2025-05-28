from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.routers import solicitudes_prestamo
from app.database import engine
from app.models import solicitud_prestamo

# Crear tablas en la base de datos
solicitud_prestamo.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Request Service")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(solicitudes_prestamo.router, prefix="/solicitudes", tags=['Requests'])

@app.get("/")
def read_root():
    return {"message": "Welcome to Request Service"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8004, reload=True)