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

      <div className="container py-5">
        <div className="row mb-5">
          <div className="col">
            <h2 className="fw-bold text-dark">
              <i className="bi bi-grid-1x2 me-3"></i>
              Panel de Administración
            </h2>
            <p className="text-muted fs-5">Gestione el sistema de biblioteca de manera eficiente</p>
          </div>
        </div>

        <div className="row g-4 justify-content-center">
          
          <div className="col-md-4">
            <div className="card h-100 shadow border-0 rounded-3">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-journal-plus text-primary" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
                <h5 className="card-title text-primary text-center fw-bold mb-3">
                  Gestión de Materiales
                </h5>
                <p className="card-text text-center text-muted">Consultar y gestionar todos los materiales disponibles</p>
              </div>
              <div className="card-footer bg-white border-0 text-center pb-4">
                <button className="btn btn-primary btn-lg px-4" onClick={() => navigate('/materials-management')}>
                  <i className="bi bi-list-check me-2"></i>
                  Ver Materiales
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow border-0 rounded-3">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-file-earmark-text text-primary" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
                <h5 className="card-title text-primary text-center fw-bold mb-3">
                  Solicitudes
                </h5>
                <p className="card-text text-center text-muted">Administrar solicitudes de préstamos</p>
              </div>
              <div className="card-footer bg-white border-0 text-center pb-4">
                <button className="btn btn-primary btn-lg px-4" onClick={() => navigate('/material-requests')}>
                  <i className="bi bi-envelope me-2"></i>
                  Solicitudes
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow border-0 rounded-3">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-clipboard2-check text-primary" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
                <h5 className="card-title text-primary text-center fw-bold mb-3">
                  Materiales en Préstamo
                </h5>
                <p className="card-text text-center text-muted">Ver listado de préstamos activos</p>
              </div>
              <div className="card-footer bg-white border-0 text-center pb-4">
                <button className="btn btn-primary btn-lg px-4" onClick={() => navigate('/loaned-materials')}>
                  <i className="bi bi-bookmarks me-2"></i>
                  Ver Préstamos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-dark text-light py-4 mt-auto">
        <div className="container text-center">
          <p className="mb-0">&copy; 2025 Sistema de Biblioteca - Panel de Administración</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;