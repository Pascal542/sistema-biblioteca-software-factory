import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from '../context/AuthContext';


const UserDashboard = () => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== 'usuario') {
      navigate('/login');
    }
  }, [role, navigate]);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <a className="navbar-brand" href="#">
            <i className="bi bi-book me-2"></i>
            Sistema de Biblioteca
          </a>
          <div className="ms-auto d-flex align-items-center text-white">
            <span className="me-3">
              <i className="bi bi-person-circle me-2"></i>
              {user.nombre}
            </span>
            <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
              <i className="bi bi-box-arrow-right me-1"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row mb-4">
          <div className="col">
            <h2>
              <i className="bi bi-grid-1x2 me-2"></i>
              Panel de Usuario
            </h2>
            <p className="text-muted">Bienvenido a su portal de biblioteca</p>
          </div>
        </div>

<div className="row">
  <div className="col-md-4 mb-4">
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="text-center mb-3">
          <i className="bi bi-journals text-primary" style={{ fontSize: '2.5rem' }}></i>
        </div>
        <h5 className="card-title text-primary text-center">
          Materiales Disponibles
        </h5>
        <p className="card-text text-center">Ver todos los materiales disponibles para préstamo</p>
      </div>
      <div className="card-footer bg-white border-0 text-center pb-3">
        <button className="btn btn-primary" onClick={() => navigate('/materials-management')}>
          <i className="bi bi-search me-2"></i>
          Ver Materiales
        </button>
      </div>
    </div>
  </div>

  {/* Nueva tarjeta para solicitudes */}
  <div className="col-md-4 mb-4">
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="text-center mb-3">
          <i className="bi bi-file-earmark-text text-primary" style={{ fontSize: '2.5rem' }}></i>
        </div>
        <h5 className="card-title text-primary text-center">
          Solicitudes de Materiales
        </h5>
        <p className="card-text text-center">Solicitar materiales y gestionar sus solicitudes</p>
      </div>
      <div className="card-footer bg-white border-0 text-center pb-3">
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-primary" onClick={() => navigate('/create-request')}>
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Solicitud
          </button>
          <button className="btn btn-outline-primary" onClick={() => navigate('/my-requests')}>
            <i className="bi bi-list-ul me-2"></i>
            Mis Solicitudes
          </button>
        </div>
      </div>
    </div>
  </div>

  <div className="col-md-4 mb-4">
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="text-center mb-3">
          <i className="bi bi-list-check text-primary" style={{ fontSize: '2.5rem' }}></i>
        </div>
        <h5 className="card-title text-primary text-center">
          Mis Préstamos
        </h5>
        <p className="card-text text-center">Gestiona tus préstamos actuales</p>
      </div>
      <div className="card-footer bg-white border-0 text-center pb-3">
        <button className="btn btn-primary" onClick={() => navigate('/client-loans')}>
          <i className="bi bi-eye me-2"></i>
          Ver Préstamos
        </button>
      </div>
    </div>
  </div>
</div>
      </div>

      <footer className="bg-dark text-light py-3 mt-5">
        <div className="container text-center">
          <p className="mb-0">&copy; 2025 Sistema de Biblioteca - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;