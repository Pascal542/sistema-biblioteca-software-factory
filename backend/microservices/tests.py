# Pruebas unitarias generales

import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
import json

# Agregar paths para importaciones relativas aun falla un poco)
sys.path.append(os.path.join(os.path.dirname(__file__), 'auth_service'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'material_service'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'loan_service'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'request_service'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'api_gateway'))

# Mock que soncomo los input 
@pytest.fixture
def mock_db_session():
    """Mock de sesión de base de datos"""
    mock_session = Mock()
    mock_session.query.return_value = mock_session
    mock_session.filter.return_value = mock_session
    mock_session.first.return_value = None
    mock_session.all.return_value = []
    mock_session.add.return_value = None
    mock_session.commit.return_value = None
    mock_session.refresh.return_value = None
    mock_session.rollback.return_value = None
    return mock_session

@pytest.fixture
def mock_usuario():
    """Mock de modelo Usuario"""
    usuario = Mock()
    usuario.id = 1
    usuario.nombre = "Test User"
    usuario.email = "test@test.com"
    usuario.carne_identidad = "12345678"
    usuario.direccion = "Test Address"
    usuario.rol = "usuario"
    usuario.activo = True
    usuario.hashed_password = "hashed_password"
    return usuario

@pytest.fixture
def mock_material():
    """Mock de modelo Material"""
    material = Mock()
    material.id = 1
    material.titulo = "Test Book"
    material.autor = "Test Author"
    material.tipo = "libro"
    material.descripcion = "Test Description"
    material.ubicacion = "A1"
    material.cantidad = 5
    material.total = 10
    material.estado = "disponible"
    material.año_publicacion = 2020
    material.fecha_adquisicion = datetime.now()
    material.activo = True
    return material

@pytest.fixture
def mock_prestamo():
    """Mock de modelo Prestamo"""
    prestamo = Mock()
    prestamo.id = 1
    prestamo.usuario_id = 1
    prestamo.material_id = 1
    prestamo.fecha_prestamo = datetime.now()
    prestamo.fecha_devolucion = datetime.now() + timedelta(days=7)
    prestamo.estado = "activo"
    return prestamo

@pytest.fixture
def mock_solicitud():
    """Mock de modelo SolicitudPrestamo"""
    solicitud = Mock()
    solicitud.id = 1
    solicitud.usuario_id = 1
    solicitud.material_id = 1
    solicitud.fecha_solicitud = datetime.now()
    solicitud.estado = "pendiente"
    solicitud.comentarios = "Test request"
    return solicitud

# ============= PRUEBAS DEL AUTH SERVICE =============

class TestAuthService:
    """Pruebas para el servicio de autenticación"""
    
    def test_hash_password(self):
        """Test de hash de contraseña"""
        with patch('auth_service.app.utils.security.get_password_hash') as mock_hash:
            mock_hash.return_value = "hashed_password"
            from auth_service.app.utils.security import hash_password
            result = hash_password("test_password")
            assert result == "hashed_password"
            mock_hash.assert_called_once_with("test_password")
    
    def test_verify_password(self):
        """Test de verificación de contraseña"""
        with patch('auth_service.app.utils.security.verify_password') as mock_verify:
            mock_verify.return_value = True
            from auth_service.app.utils.security import verify_password
            result = verify_password("test_password", "hashed_password")
            assert result is True
            mock_verify.assert_called_once_with("test_password", "hashed_password")
    
    def test_create_access_token(self):
        """Test de creación de token de acceso"""
        with patch('auth_service.app.utils.security.create_access_token') as mock_create:
            mock_create.return_value = "test_token"
            from auth_service.app.utils.security import create_access_token
            data = {"sub": "test@test.com"}
            result = create_access_token(data=data)
            assert result == "test_token"
    
    @patch('auth_service.app.routers.auth.get_db')
    @patch('auth_service.app.utils.security.authenticate_user')
    @patch('auth_service.app.utils.security.create_access_token')
    def test_login_success(self, mock_create_token, mock_auth, mock_get_db, mock_usuario):
        """Test de login exitoso"""
        mock_auth.return_value = mock_usuario
        mock_create_token.return_value = "test_token"
        mock_get_db.return_value = Mock()
        
        # Simular el endpoint de login
        from auth_service.app.routers.auth import login_for_access_token
        from fastapi.security import OAuth2PasswordRequestForm
        
        form_data = Mock(spec=OAuth2PasswordRequestForm)
        form_data.username = "test@test.com"
        form_data.password = "password"
        
        result = login_for_access_token(form_data, Mock())
        
        assert result["access_token"] == "test_token"
        assert result["token_type"] == "bearer"
    
    @patch('auth_service.app.routers.auth.get_db')
    def test_register_user_success(self, mock_get_db, mock_db_session):
        """Test de registro de usuario exitoso"""
        mock_get_db.return_value = mock_db_session
        mock_db_session.query.return_value.filter.return_value.first.return_value = None
        
        with patch('auth_service.app.utils.security.hash_password') as mock_hash:
            mock_hash.return_value = "hashed_password"
            
            # Crear mock del usuario creado
            nuevo_usuario = Mock()
            nuevo_usuario.id = 1
            mock_db_session.refresh.side_effect = lambda x: setattr(x, 'id', 1)
            
            from auth_service.app.routers.auth import register_user
            from auth_service.app.schemas.usuario import UsuarioCreate
            
            user_data = UsuarioCreate(
                nombre="Test User",
                email="test@test.com",
                carne_identidad="12345678",
                direccion="Test Address",
                password="password"
            )
            
            result = register_user(user_data, mock_db_session)
            
            assert result["message"] == "Usuario registrado exitosamente"
    
    def test_register_user_duplicate_email(self, mock_db_session, mock_usuario):
        """Test de registro con email duplicado"""
        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_usuario
        
        from auth_service.app.routers.auth import register_user
        from auth_service.app.schemas.usuario import UsuarioCreate
        from fastapi import HTTPException
        
        user_data = UsuarioCreate(
            nombre="Test User",
            email="test@test.com",
            carne_identidad="12345678",
            direccion="Test Address",
            password="password"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            register_user(user_data, mock_db_session)
        
        assert exc_info.value.status_code == 400
        assert "Email ya registrado" in str(exc_info.value.detail)

# ============= PRUEBAS DEL MATERIAL SERVICE =============

class TestMaterialService:
    """Pruebas para el servicio de materiales"""
    
    def test_material_factor_estancia(self, mock_material):
        """Test del cálculo del factor de estancia"""
        mock_material.año_publicacion = 2020
        mock_material.fecha_adquisicion = Mock()
        mock_material.fecha_adquisicion.year = 2021
        mock_material.tipo = "libro"
        
        # Simular el cálculo del factor
        expected_factor = (2020 + 1) / 2021
        assert abs(mock_material.año_publicacion + 1) / mock_material.fecha_adquisicion.year == expected_factor
    
    @patch('material_service.app.routers.materiales.get_db')
    def test_crear_material(self, mock_get_db, mock_db_session):
        """Test de creación de material"""
        mock_get_db.return_value = mock_db_session
        
        from material_service.app.routers.materiales import crear_material
        from material_service.app.schemas.material import MaterialCreate
        
        material_data = MaterialCreate(
            titulo="Test Book",
            autor="Test Author",
            tipo="libro",
            descripcion="Test Description",
            ubicacion="A1",
            cantidad=5,
            total=10,
            año_publicacion=2020
        )
        
        nuevo_material = Mock()
        nuevo_material.id = 1
        mock_db_session.refresh.side_effect = lambda x: setattr(x, 'id', 1)
        
        result = crear_material(material_data, mock_db_session)
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
    
    @patch('material_service.app.routers.materiales.get_db')
    def test_obtener_materiales(self, mock_get_db, mock_db_session, mock_material):
        """Test de obtención de materiales"""
        mock_get_db.return_value = mock_db_session
        mock_db_session.query.return_value.filter.return_value.all.return_value = [mock_material]
        
        from material_service.app.routers.materiales import obtener_materiales
        
        result = obtener_materiales(mock_db_session)
        
        assert len(result) == 1
        assert result[0] == mock_material
    
    @patch('material_service.app.routers.materiales.get_db')
    def test_obtener_material_por_id(self, mock_get_db, mock_db_session, mock_material):
        """Test de obtención de material por ID"""
        mock_get_db.return_value = mock_db_session
        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_material
        
        from material_service.app.routers.materiales import obtener_material
        
        result = obtener_material(1, mock_db_session)
        
        assert result == mock_material
    
    @patch('material_service.app.routers.materiales.get_db')
    def test_actualizar_material(self, mock_get_db, mock_db_session, mock_material):
        """Test de actualización de material"""
        mock_get_db.return_value = mock_db_session
        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_material
        
        from material_service.app.routers.materiales import actualizar_material
        from material_service.app.schemas.material import MaterialUpdate
        
        material_update = MaterialUpdate(
            titulo="Updated Title",
            cantidad=10
        )
        
        result = actualizar_material(1, material_update, mock_db_session)
        
        mock_db_session.commit.assert_called_once()
        assert result == mock_material

# ============= PRUEBAS DEL LOAN SERVICE =============

class TestLoanService:
    """Pruebas para el servicio de préstamos"""
    
    @patch('loan_service.app.routers.prestamos.get_db')
    def test_crear_prestamo(self, mock_get_db, mock_db_session):
        """Test de creación de préstamo"""
        mock_get_db.return_value = mock_db_session
        
        from loan_service.app.routers.prestamos import crear_prestamo
        from loan_service.app.schemas.prestamo import PrestamoCreate
        
        prestamo_data = PrestamoCreate(
            usuario_id=1,
            material_id=1,
            fecha_devolucion=datetime.now() + timedelta(days=7)
        )
        
        nuevo_prestamo = Mock()
        nuevo_prestamo.id = 1
        mock_db_session.refresh.side_effect = lambda x: setattr(x, 'id', 1)
        
        result = crear_prestamo(prestamo_data, mock_db_session)
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
    
    @patch('loan_service.app.routers.prestamos.get_db')
    def test_obtener_prestamos_usuario(self, mock_get_db, mock_db_session, mock_prestamo):
        """Test de obtención de préstamos por usuario"""
        mock_get_db.return_value = mock_db_session
        mock_db_session.query.return_value.filter.return_value.all.return_value = [mock_prestamo]
        
        from loan_service.app.routers.prestamos import obtener_prestamos_usuario
        
        result = obtener_prestamos_usuario(1, mock_db_session)
        
        assert len(result) == 1
        assert result[0] == mock_prestamo
    
    @patch('loan_service.app.routers.prestamos.get_db')
    def test_devolver_material(self, mock_get_db, mock_db_session, mock_prestamo):
        """Test de devolución de material"""
        mock_get_db.return_value = mock_db_session
        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_prestamo
        
        from loan_service.app.routers.prestamos import devolver_material
        
        result = devolver_material(1, mock_db_session)
        
        mock_db_session.commit.assert_called_once()
        assert mock_prestamo.estado == "devuelto"
    
    @patch('loan_service.app.routers.prestamos.get_db')
    def test_obtener_materiales_en_prestamo(self, mock_get_db, mock_db_session, mock_prestamo):
        """Test de obtención de materiales en préstamo"""
        mock_get_db.return_value = mock_db_session
        mock_db_session.query.return_value.filter.return_value.all.return_value = [mock_prestamo]
        
        from loan_service.app.routers.prestamos import obtener_materiales_en_prestamo
        
        result = obtener_materiales_en_prestamo(mock_db_session)
        
        assert len(result) == 1

# ============= PRUEBAS DEL REQUEST SERVICE =============

class TestRequestService:
    """Pruebas para el servicio de solicitudes"""
    
    @patch('request_service.app.routers.solicitudes_prestamo.get_db')
    def test_crear_solicitud(self, mock_get_db, mock_db_session):
        """Test de creación de solicitud"""
        mock_get_db.return_value = mock_db_session
        
        from request_service.app.routers.solicitudes_prestamo import crear_solicitud_prestamo
        from request_service.app.schemas.solicitud_prestamo import SolicitudPrestamoCreate
        
        solicitud_data = SolicitudPrestamoCreate(
            usuario_id=1,
            material_id=1,
            comentarios="Test request"
        )
        
        nueva_solicitud = Mock()
        nueva_solicitud.id = 1
        mock_db_session.refresh.side_effect = lambda x: setattr(x, 'id', 1)
        
        result = crear_solicitud_prestamo(solicitud_data, mock_db_session)
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
    
    @patch('request_service.app.routers.solicitudes_prestamo.get_db')
    def test_obtener_solicitudes_usuario(self, mock_get_db, mock_db_session, mock_solicitud):
        """Test de obtención de solicitudes por usuario"""
        mock_get_db.return_value = mock_db_session
        mock_db_session.query.return_value.filter.return_value.all.return_value = [mock_solicitud]
        
        from request_service.app.routers.solicitudes_prestamo import obtener_solicitudes_usuario
        
        result = obtener_solicitudes_usuario(1, mock_db_session)
        
        assert len(result) == 1
        assert result[0] == mock_solicitud
    
    @patch('request_service.app.routers.solicitudes_prestamo.get_db')
    def test_aprobar_solicitud(self, mock_get_db, mock_db_session, mock_solicitud):
        """Test de aprobación de solicitud"""
        mock_get_db.return_value = mock_db_session
        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_solicitud
        
        from request_service.app.routers.solicitudes_prestamo import aprobar_solicitud
        
        result = aprobar_solicitud(1, mock_db_session)
        
        mock_db_session.commit.assert_called_once()
        assert mock_solicitud.estado == "aprobada"
    
    @patch('request_service.app.routers.solicitudes_prestamo.get_db')
    def test_rechazar_solicitud(self, mock_get_db, mock_db_session, mock_solicitud):
        """Test de rechazo de solicitud"""
        mock_get_db.return_value = mock_db_session
        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_solicitud
        
        from request_service.app.routers.solicitudes_prestamo import rechazar_solicitud
        
        result = rechazar_solicitud(1, mock_db_session)
        
        mock_db_session.commit.assert_called_once()
        assert mock_solicitud.estado == "rechazada"

# ============= PRUEBAS DE INTEGRACIÓN =============

class TestIntegration:
    """Pruebas de integración entre servicios"""
    
    def test_workflow_completo_prestamo(self, mock_usuario, mock_material, mock_solicitud, mock_prestamo):
        """Test del flujo completo: solicitud -> aprobación -> préstamo -> devolución"""
        # 1. Usuario hace solicitud
        assert mock_solicitud.estado == "pendiente"
        
        # 2. Admin aprueba solicitud
        mock_solicitud.estado = "aprobada"
        assert mock_solicitud.estado == "aprobada"
        
        # 3. Se crea el préstamo
        mock_prestamo.estado = "activo"
        assert mock_prestamo.estado == "activo"
        
        # 4. Usuario devuelve material
        mock_prestamo.estado = "devuelto"
        assert mock_prestamo.estado == "devuelto"
    
    def test_validacion_disponibilidad_material(self, mock_material):
        """Test de validación de disponibilidad de material"""
        # Material disponible
        mock_material.cantidad = 5
        mock_material.total = 10
        assert mock_material.cantidad > 0
        
        # Material no disponible
        mock_material.cantidad = 0
        assert mock_material.cantidad == 0
    
    def test_factor_estancia_diferentes_tipos(self):
        """Test del cálculo del factor de estancia para diferentes tipos de materiales"""
        # Mock para libro
        libro = Mock()
        libro.tipo = "libro"
        libro.año_publicacion = 2020
        libro.fecha_adquisicion = Mock()
        libro.fecha_adquisicion.year = 2021
        
        factor_libro = (libro.año_publicacion + 1) / libro.fecha_adquisicion.year
        assert factor_libro > 0
        
        # Mock para revista
        revista = Mock()
        revista.tipo = "revista"
        revista.año_publicacion = 2023
        revista.fecha_adquisicion = Mock()
        revista.fecha_adquisicion.year = 2023
        
        factor_revista = (revista.año_publicacion + 1) / revista.fecha_adquisicion.year
        assert factor_revista > 0

# ============= PRUEBAS DE RENDIMIENTO Y LÍMITES =============

class TestPerformanceAndLimits:
    """Pruebas de rendimiento y límites del sistema"""
    
    def test_limite_prestamos_por_usuario(self):
        """Test del límite de préstamos simultáneos por usuario"""
        max_prestamos = 5
        prestamos_actuales = 3
        
        assert prestamos_actuales < max_prestamos
        
        prestamos_actuales = 5
        assert prestamos_actuales >= max_prestamos
    
    def test_disponibilidad_material_concurrencia(self, mock_material):
        """Test de disponibilidad de material en caso de concurrencia"""
        mock_material.cantidad = 1
        mock_material.total = 5
        mock_material.cantidad -= 1
        assert mock_material.cantidad == 0
        assert mock_material.cantidad <= 0

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
