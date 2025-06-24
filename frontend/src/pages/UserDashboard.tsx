import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfileModal from '../components/UserProfileModal';

const UserDashboard = () => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (role !== 'usuario') {
      navigate('/login');
    }
  }, [role, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleShowProfile = () => {
    setShowProfileModal(true);
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-light">Cargando tu biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f8f9fa 0%,rgb(239, 239, 233) 100%)'}}>
      {/* Header */}
      <header className="navbar navbar-expand-lg shadow-sm" style={{background: 'linear-gradient(135deg, #853303 0%, #945c08 100%)'}}>
        <div className="container">
          <div className="navbar-brand text-white d-flex align-items-center">
            <div className="me-2 p-2 rounded">
              <i className="bi bi-book-half text-white"></i>
            </div>
            <div>
              <h5 className="mb-0">Prestamos SF</h5>
              <small className="opacity-75">Sistema de Biblioteca</small>
            </div>
          </div>
          <div className="dropdown">
            <button className="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                    data-bs-toggle="dropdown" aria-expanded="false">
              <i className="bi bi-person-circle me-2"></i>
              <span>{user.nombre}</span>
            </button>            <ul className="dropdown-menu dropdown-menu-end shadow border-0">
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={handleShowProfile}
                  type="button"
                >
                  <i className="bi bi-person me-2"></i>Mi Perfil
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button onClick={handleLogout} className="dropdown-item text-danger">
                  <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="py-4">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark mb-2">
              ¡Bienvenido, {user.nombre}! 📚
            </h2>
            <p className="text-muted">
              Gestiona tus préstamos y explora nuestra colección digital
            </p>
          </div>
        </div>
      </section>

      {/* Main Cards */}
      <section className="py-3">
        <div className="container">
          <div className="row g-4">
            {/* Catálogo Digital */}
            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm h-100 card-hover">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="p-2 bg-primary bg-opacity-10 rounded me-3">
                      <i className="bi bi-journals text-primary" style={{fontSize: '1.5rem'}}></i>
                    </div>
                    <div>
                      <h5 className="card-title mb-0">Catálogo Digital</h5>
                      <small className="text-muted">Explora materiales</small>
                    </div>
                  </div>
                  <p className="card-text text-muted mb-3">
                    Descubre recursos académicos, libros digitales y materiales especializados
                  </p>
                  <button className="btn btn-primary btn-sm w-100" 
                          onClick={() => navigate('/materials-management')}>
                    <i className="bi bi-search me-1"></i>Explorar Catálogo
                  </button>
                </div>
              </div>
            </div>

            {/* Solicitudes */}
            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm h-100 card-hover">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="p-2 bg-success bg-opacity-10 rounded me-3">
                      <i className="bi bi-file-earmark-plus text-success" style={{fontSize: '1.5rem'}}></i>
                    </div>
                    <div>
                      <h5 className="card-title mb-0">Solicitudes</h5>
                      <small className="text-muted">Gestiona peticiones</small>
                    </div>
                  </div>
                  <p className="card-text text-muted mb-3">
                    Solicita materiales y rastrea el estado de tus peticiones
                  </p>
                  <div className="d-grid gap-2">
                    <button className="btn btn-success btn-sm" 
                            onClick={() => navigate('/create-request')}>
                      <i className="bi bi-plus-circle me-1"></i>Nueva Solicitud
                    </button>
                    <button className="btn btn-outline-success btn-sm" 
                            onClick={() => navigate('/my-requests')}>
                      <i className="bi bi-list-ul me-1"></i>Mis Solicitudes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Préstamos */}
            <div className="col-lg-4 col-md-6 mx-auto">
              <div className="card border-0 shadow-sm h-100 card-hover">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="p-2 bg-warning bg-opacity-10 rounded me-3">
                      <i className="bi bi-bookmark-check text-warning" style={{fontSize: '1.5rem'}}></i>
                    </div>
                    <div>
                      <h5 className="card-title mb-0">Mis Préstamos</h5>
                      <small className="text-muted">Préstamos activos</small>
                    </div>
                  </div>
                  <p className="card-text text-muted mb-3">
                    Administra tus préstamos activos y fechas de devolución
                  </p>
                  <button className="btn btn-warning btn-sm w-100" 
                          onClick={() => navigate('/client-loans')}>
                    <i className="bi bi-eye me-1"></i>Ver Préstamos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-4">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4">
              <div className="p-3">
                <i className="bi bi-collection text-primary mb-2" style={{fontSize: '2rem'}}></i>
                <h6 className="text-muted mb-0">+1,500 Materiales</h6>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <i className="bi bi-clock text-success mb-2" style={{fontSize: '2rem'}}></i>
                <h6 className="text-muted mb-0">Acceso 24/7</h6>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <i className="bi bi-shield-check text-info mb-2" style={{fontSize: '2rem'}}></i>
                <h6 className="text-muted mb-0">100% Seguro</h6>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-2 mt-4 bg-dark text-white mb-0 position-absolute w-100" style={{bottom: 0}}>
        <div className="container">
          <div className="row align-items-center">
            { /* Left Column */}
        <div className="col-md-6 text-center text-md-start mb-1 mb-md-0">
          <h6 className="mb-3">Prestamos SF</h6>
          <div className="d-flex justify-content-center justify-content-md-start">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="me-3">
          <i className="fa-brands fa-facebook fa-2x" style={{ color: '#3b5998' }}></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="me-3">
          <i className="fa-brands fa-twitter fa-2x" style={{ color: '#1da1f2' }}></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-instagram fa-2x" style={{ color: '#e4405f' }}></i>
            </a>
          </div>
        </div>
        {/* Right Column */}
        <div className="col-md-6 text-center text-md-end">
          <p className="text-white small mb-0">
            <i className="fa-solid fa-envelope me-1"></i> arefqf@gmail.com
          </p>
          <p className="text-white small mb-0">
            &copy; 2025 Prestamos SF. Todos los derechos reservados.
          </p>
        </div>
          </div>
        </div>
      </footer>


      <style>{`
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        .navbar-brand h5 {
          font-weight: 600;
        }      `}</style>

      {/* User Profile Modal */}
      <UserProfileModal 
        show={showProfileModal} 
        onClose={handleCloseProfile} 
      />
    </div>
  );
};

export default UserDashboard;