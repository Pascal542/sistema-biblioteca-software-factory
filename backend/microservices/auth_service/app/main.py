from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from app.routers import auth, usuarios
from app.database import engine, Base
from sqlalchemy import text
from app.models.usuario import Usuario

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to Auth Service"}

@app.on_event("startup")
async def startup_event():
    try:
        logger.info(" Iniciando Auth Service...")
        logger.info("Modelos importados: Usuario")
        
        print("Verificando estructura de la base de datos...")
        logger.info("Verificando estructura de la base de datos...")
        
        with engine.connect() as connection:
            logger.info("Conexión a base de datos establecida")
            
            # Check if table exists and drop it
            try:
                logger.info("Verificando si existe tabla 'usuarios'...")
                result = connection.execute(text("SHOW TABLES LIKE 'usuarios'"))
                if result.fetchone():
                    print("Tabla 'usuarios' existente encontrada, eliminando...")
                    logger.info("Tabla 'usuarios' existente encontrada, eliminando...")
                    connection.execute(text("DROP TABLE usuarios"))
                    connection.commit()
                    print("Tabla anterior eliminada")
                    logger.info("Tabla anterior eliminada")
                else:
                    print("No se encontró tabla anterior")
                    logger.info("No se encontró tabla anterior")
            except Exception as e:
                print(f"Error al verificar/eliminar tabla: {e}")
                logger.warning(f"Error al verificar/eliminar tabla: {e}")
        
        # Create tables with the correct structure
        print("Creando tablas con estructura correcta...")
        logger.info("Creando tablas con estructura correcta...")
        Base.metadata.create_all(bind=engine)
        print("Tablas creadas exitosamente")
        logger.info("Tablas creadas exitosamente")
        
        # Verify table structure
        with engine.connect() as connection:
            logger.info("Verificando estructura de tabla creada...")
            result = connection.execute(text("DESCRIBE usuarios"))
            columns = result.fetchall()
            print("Estructura de la tabla usuarios:")
            logger.info("Estructura de la tabla usuarios:")
            for column in columns:
                print(f"   - {column[0]}: {column[1]}")
                logger.info(f"   - {column[0]}: {column[1]}")
        
        print("Auth Service iniciado correctamente en puerto 8001")
        logger.info("Auth Service iniciado correctamente en puerto 8001")
                
    except Exception as e:
        print(f"Error al configurar la base de datos: {e}")
        logger.error(f"Error al configurar la base de datos: {e}")
        raise

if __name__ == "__main__":
    logger.info("Iniciando servidor con uvicorn...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
