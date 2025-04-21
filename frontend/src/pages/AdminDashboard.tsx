import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <a className="navbar-brand" href="#">
            <i className="bi bi-book me-2"></i>
            Sistema de Biblioteca - Administración
          </a>
          <div className="ms-auto d-flex align-items-center text-white">
            <span className="me-3">
              <i className="bi bi-person-circle me-2"></i>
              {user?.nombre || user?.email} (Administrador)
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
              Panel de Administración
            </h2>
            <p className="text-muted">Gestione el sistema de biblioteca</p>
          </div>
        </div>

        <div className="row">
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="text-center mb-3">
                  <i className="bi bi-journal-plus text-primary" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h5 className="card-title text-primary text-center">
                  Gestión de Materiales
                </h5>
                <p className="card-text text-center">Consultar y gestionar todos los materiales disponibles</p>
              </div>
              <div className="card-footer bg-white border-0 text-center pb-3">
                <button className="btn btn-primary" onClick={() => navigate('/materials-management')}>
                  <i className="bi bi-list-check me-2"></i>
                  Ver Materiales
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="text-center mb-3">
                  <i className="bi bi-file-earmark-text text-primary" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h5 className="card-title text-primary text-center">
                  Solicitudes
                </h5>
                <p className="card-text text-center">Administrar solicitudes de préstamos</p>
              </div>
              <div className="card-footer bg-white border-0 text-center pb-3">
                <div className="d-flex gap-2 justify-content-center">
                  <button className="btn btn-primary" onClick={() => navigate('/material-requests')}>
                    <i className="bi bi-envelope me-2"></i>
                    Solicitudes
                  </button>

                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="text-center mb-3">
                  <i className="bi bi-people text-primary" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h5 className="card-title text-primary text-center">
                  Gestión de Usuarios
                </h5>
                <p className="card-text text-center">Administrar usuarios y credenciales</p>
              </div>
              <div className="card-footer bg-white border-0 text-center pb-3">
                <button className="btn btn-primary" onClick={() => navigate('/admin-tools')}>
                  <i className="bi bi-gear-fill me-2"></i>
                  Herramientas Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row">

          <div className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="text-center mb-3">
                  <i className="bi bi-clipboard2-check text-primary" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h5 className="card-title text-primary text-center">
                  Materiales en Préstamo
                </h5>
                <p className="card-text text-center">Ver listado de préstamos activos</p>
              </div>
              <div className="card-footer bg-white border-0 text-center pb-3">
                <button className="btn btn-primary" onClick={() => navigate('/loaned-materials')}>
                  <i className="bi bi-bookmarks me-2"></i>
                  Ver Préstamos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-dark text-light py-3 mt-5">
        <div className="container text-center">
          <p className="mb-0">&copy; 2025 Sistema de Biblioteca - Panel de Administración</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;