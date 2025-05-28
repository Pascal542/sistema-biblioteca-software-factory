from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# MySQL connection string format: mysql+pymysql://username:password@host:port/database_name
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:12345678@localhost:3306/sf38_prestamos")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()