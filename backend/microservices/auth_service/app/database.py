from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:12345678@localhost:3306/sf38_auth")

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False
    )
    print(f"✅ Conectando a la base de datos: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else DATABASE_URL}")
except Exception as e:
    print(f"❌ Error al conectar con la base de datos: {e}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()