from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.routers import materiales
from app.database import engine
from app.models import material

# Crear tablas en la base de datos
material.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Material Service")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(materiales.router, prefix="/materiales", tags=['Materials'])

@app.get("/")
def read_root():
    return {"message": "Welcome to Material Service"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)