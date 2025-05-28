from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.routers import prestamos
from app.database import engine
from app.models import prestamo

# Crear tablas en la base de datos
prestamo.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Loan Service")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prestamos.router, prefix="/prestamos", tags=['Loans'])

@app.get("/")
def read_root():
    return {"message": "Welcome to Loan Service"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)