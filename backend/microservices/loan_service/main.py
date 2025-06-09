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

# Add a route to match frontend expectation
@app.get("/api/materiales/en-prestamo")
async def materiales_en_prestamo():
    """Redirect to the actual endpoint"""
    from app.routers.prestamos import obtener_materiales_en_prestamo
    from app.database import get_db
    db = next(get_db())
    return await obtener_materiales_en_prestamo(db)

@app.get("/")
def read_root():
    return {"message": "Welcome to Loan Service"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)