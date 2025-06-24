import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f8f9fa 0%,rgb(239, 239, 233) 100%)'}}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{background: 'linear-gradient(135deg, #853303 0%, #945c08 100%)'}}>
        <div className="container">
          <div className="navbar-brand d-flex align-items-center">
            <div>
              <h4 className="mb-0 text-white fw-bold">Panel Administrativo</h4>
              <small className="text-white-50">Sistema de Biblioteca</small>
            </div>
          </div>
          
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              <i className="bi bi-person-badge me-2"></i>
              {user?.nombre || user?.email}
            </span>
            <button onClick={handleLogout} className="btn btn-light btn-sm">
              <i className="bi bi-box-arrow-right me-1"></i>
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-2">
        {/* Welcome Section */}
        <div className="text-center mb-2">
          <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
               style={{width: '80px', height: '80px'}}>
            <i className="bi bi-gear-wide-connected text-primary" style={{fontSize: '2.5rem'}}></i>
          </div>
          <h1 className="text-dark fw-bold mb-2">Bienvenido Administrador</h1>
        </div>

        {/* Main Navigation Cards */}
        <div className="row g-4 mb-5">
          <div className="col-lg-4">
            <div className="card h-100 border-0 shadow-lg admin-card" 
                 onClick={() => navigate('/materials-management')}
                 style={{cursor: 'pointer'}}>
              <div className="card-body text-center p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{width: '70px', height: '70px'}}>
                  <i className="bi bi-collection text-primary" style={{fontSize: '2rem'}}></i>
                </div>
                <h4 className="card-title text-primary fw-bold mb-3">Gestión de Materiales</h4>
                <p className="card-text text-muted">
                  Administra el catálogo completo de materiales, libros y recursos de la biblioteca
                </p>
                <div className="mt-4">
                  <span className="btn btn-primary btn-lg px-4">
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    Acceder
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card h-100 border-0 shadow-lg admin-card"
                 onClick={() => navigate('/material-requests')}
                 style={{cursor: 'pointer'}}>
              <div className="card-body text-center p-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{width: '70px', height: '70px'}}>
                  <i className="bi bi-clipboard-check text-success" style={{fontSize: '2rem'}}></i>
                </div>
                <h4 className="card-title text-success fw-bold mb-3">Solicitudes de Préstamo</h4>
                <p className="card-text text-muted">
                  Revisa y gestiona las solicitudes de préstamo enviadas por los usuarios
                </p>
                <div className="mt-4">
                  <span className="btn btn-success btn-lg px-4">
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    Revisar
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card h-100 border-0 shadow-lg admin-card"
                 onClick={() => navigate('/loaned-materials')}
                 style={{cursor: 'pointer'}}>
              <div className="card-body text-center p-4">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{width: '70px', height: '70px'}}>
                  <i className="bi bi-bookmark-star text-warning" style={{fontSize: '2rem'}}></i>
                </div>
                <h4 className="card-title text-warning fw-bold mb-3">Préstamos Activos</h4>
                <p className="card-text text-muted">
                  Controla y administra todos los préstamos activos y sus fechas de devolución
                </p>
                <div className="mt-4">
                  <span className="btn btn-warning btn-lg px-4">
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    Monitorear
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-5 py-4 bg-dark position-absolute w-100" style={{bottom: 0}}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h6 className="text-white mb-2">Sistema de Biblioteca SF</h6>
              <p className="text-white-50 small mb-0">Panel de Administración</p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="text-white-50 small mb-0">
                &copy; 2025 Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .admin-card {
          transition: all 0.3s ease;
          border-radius: 15px;
        }
        .admin-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
        }
        .card-body {
          border-radius: 15px;
        }
        .navbar {
          backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;