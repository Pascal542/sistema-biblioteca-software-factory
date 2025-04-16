from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from .models import Usuario, Libro, Revista, ActaCongreso, Prestamo
from .models import GeneroLibro, FrecuenciaPublicacion

# Datos de ejemplo
nombres = ["Juan", "María", "Carlos", "Ana", "Luis", "Laura", "Pedro", "Sofía", "Miguel", "Elena"]
apellidos = ["García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín"]
calles = ["Calle Principal", "Avenida Central", "Calle Secundaria", "Boulevard Norte", "Calle Este"]
ciudades = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao"]

# Títulos y autores para libros
titulos_libros = [
    "El Principito", "Cien años de soledad", "Don Quijote", "1984", "Orgullo y prejuicio",
    "Crimen y castigo", "El señor de los anillos", "Harry Potter", "El código Da Vinci",
    "Los juegos del hambre", "El alquimista", "El retrato de Dorian Gray"
]
autores_libros = [
    "Antoine de Saint-Exupéry", "Gabriel García Márquez", "Miguel de Cervantes",
    "George Orwell", "Jane Austen", "Fiódor Dostoyevski", "J.R.R. Tolkien",
    "J.K. Rowling", "Dan Brown", "Suzanne Collins", "Paulo Coelho", "Oscar Wilde"
]

# Títulos y autores para revistas
titulos_revistas = [
    "National Geographic", "Time", "Scientific American", "The Economist",
    "Wired", "Popular Science", "Discover", "New Scientist", "Science",
    "Nature", "MIT Technology Review", "Scientific American Mind"
]
autores_revistas = [
    "Editorial Staff", "Various Authors", "Science Team", "Research Group",
    "Editorial Board", "Contributing Writers", "Science Editors", "Research Staff"
]

# Títulos para actas
titulos_actas = [
    "Proceedings of the International Conference on Computer Science",
    "Advances in Artificial Intelligence Research",
    "International Symposium on Machine Learning",
    "Conference on Neural Information Processing Systems",
    "International Conference on Learning Representations",
    "Conference on Computer Vision and Pattern Recognition",
    "International Conference on Machine Learning",
    "European Conference on Computer Vision",
    "International Conference on Robotics and Automation",
    "Conference on Human Factors in Computing Systems"
]

def crear_usuarios(db: Session, cantidad: int = 50):
    for i in range(cantidad):
        nombre = f"{random.choice(nombres)} {random.choice(apellidos)}"
        carne = f"CI{random.randint(100000, 999999)}"
        direccion = f"{random.choice(calles)} {random.randint(1, 100)}, {random.choice(ciudades)}"
        
        usuario = Usuario(
            nombre=nombre,
            carne_identidad=carne,
            direccion=direccion
        )
        db.add(usuario)
    db.commit()

def crear_libros(db: Session, cantidad: int = 60):
    for i in range(cantidad):
        libro = Libro(
            tipo="libro",
            identificador=f"LIB{i+1:03d}",
            titulo=random.choice(titulos_libros),
            autor=random.choice(autores_libros),
            anio_publicacion=random.randint(1950, 2023),
            anio_llegada=random.randint(2010, 2023),
            editorial=f"Editorial {random.choice(['A', 'B', 'C', 'D', 'E'])}",
            cantidad_total=random.randint(1, 10),
            cantidad_prestamo=0,
            genero=random.choice(list(GeneroLibro))
        )
        db.add(libro)
    db.commit()

def crear_revistas(db: Session, cantidad: int = 60):
    for i in range(cantidad):
        revista = Revista(
            tipo="revista",
            identificador=f"REV{i+1:03d}",
            titulo=random.choice(titulos_revistas),
            autor=random.choice(autores_revistas),
            anio_publicacion=random.randint(2010, 2023),
            anio_llegada=random.randint(2015, 2023),
            editorial=f"Editorial {random.choice(['X', 'Y', 'Z'])}",
            cantidad_total=random.randint(1, 5),
            cantidad_prestamo=0,
            frecuencia_publicacion=random.choice(list(FrecuenciaPublicacion))
        )
        db.add(revista)
    db.commit()

def crear_actas(db: Session, cantidad: int = 60):
    for i in range(cantidad):
        acta = ActaCongreso(
            tipo="acta",
            identificador=f"ACT{i+1:03d}",
            titulo=random.choice(titulos_actas),
            autor="Various Authors",
            anio_publicacion=random.randint(2015, 2023),
            anio_llegada=random.randint(2018, 2023),
            editorial="Conference Proceedings",
            cantidad_total=random.randint(1, 3),
            cantidad_prestamo=0,
            nombre_congreso=f"Congreso Internacional {random.choice(['A', 'B', 'C'])} {random.randint(1, 10)}"
        )
        db.add(acta)
    db.commit()

def crear_prestamos(db: Session, cantidad: int = 100):
    usuarios = db.query(Usuario).all()
    materiales = db.query(Libro).all() + db.query(Revista).all() + db.query(ActaCongreso).all()
    
    for i in range(cantidad):
        usuario = random.choice(usuarios)
        material = random.choice(materiales)
        
        # Verificar si hay ejemplares disponibles
        if material.cantidad_prestamo < material.cantidad_total:
            fecha_prestamo = datetime.now() - timedelta(days=random.randint(0, 30))
            prestamo = Prestamo(
                usuario_id=usuario.id,
                material_id=material.id,
                fecha_prestamo=fecha_prestamo,
                estado="activo"
            )
            material.cantidad_prestamo += 1
            db.add(prestamo)
    db.commit()

def inicializar_datos(db: Session):
    print("Creando usuarios...")
    crear_usuarios(db)
    print("Creando libros...")
    crear_libros(db)
    print("Creando revistas...")
    crear_revistas(db)
    print("Creando actas...")
    crear_actas(db)
    print("Creando préstamos...")
    crear_prestamos(db)
    print("¡Datos inicializados correctamente!") 