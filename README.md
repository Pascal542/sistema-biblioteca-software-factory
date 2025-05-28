# Sistema de Biblioteca - Backend

Este es el backend de un sistema de gestión de biblioteca desarrollado con FastAPI y SQLite.

## Requisitos Previos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd sistema-biblioteca-software-factory
```

2. Crear y activar un entorno virtual:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Instalar las dependencias:
```bash
cd backend
pip install -r requirements.txt
```

## Estructura del Proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── usuario.py
│   │   ├── material.py
│   │   └── prestamo.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── usuario.py
│   │   ├── material.py
│   │   └── prestamo.py
│   └── routers/
│       ├── __init__.py
│       ├── usuarios.py
│       ├── materiales.py
│       └── prestamos.py
└── requirements.txt
```

## Ejecución

1. Asegúrate de estar en la carpeta `backend`:
```bash
cd backend
```

2. Iniciar el servidor:
```bash
uvicorn app.main:app --reload
```

3. Acceder a la API:
- API: http://localhost:8000
- Documentación Swagger UI: http://localhost:8000/docs
- Documentación ReDoc: s

## Endpoints Disponibles

### Usuarios
- `POST /api/usuarios/` - Crear usuario
- `GET /api/usuarios/` - Listar usuarios
- `GET /api/usuarios/{id}` - Obtener usuario específico
- `PUT /api/usuarios/{id}` - Actualizar usuario
- `DELETE /api/usuarios/{id}` - Eliminar usuario

### Materiales
- `POST /api/materiales/libros/` - Crear libro
- `POST /api/materiales/revistas/` - Crear revista
- `POST /api/materiales/actas/` - Crear acta de congreso
- `GET /api/materiales/` - Listar materiales
- `GET /api/materiales/{id}` - Obtener material específico
- `PUT /api/materiales/{id}` - Actualizar material
- `DELETE /api/materiales/{id}` - Eliminar material

### Préstamos
- `POST /api/prestamos/` - Crear préstamo
- `GET /api/prestamos/` - Listar préstamos
- `GET /api/prestamos/{id}` - Obtener préstamo específico
- `PUT /api/prestamos/{id}/devolver` - Devolver préstamo

## Base de Datos

El proyecto utiliza SQLite como base de datos. El archivo `biblioteca.db` se crea automáticamente al iniciar la aplicación por primera vez.

## Notas Importantes

- El servidor se ejecuta en modo desarrollo con `--reload`, lo que significa que se reiniciará automáticamente cuando detecte cambios en el código.
- La base de datos SQLite se crea en la carpeta `backend` con el nombre `biblioteca.db`.
- Para desarrollo local, asegúrate de tener todas las dependencias instaladas correctamente.

## Próximos Pasos

- Implementar autenticación y autorización
- Agregar validaciones adicionales
- Implementar pruebas unitarias
- Desarrollar el frontend
 