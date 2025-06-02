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
      <div className="d-flex justify-content-center align-items-center vh-100 bg-gradient" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
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
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
      {/* Header más atractivo */}
      <header className="navbar navbar-expand-lg shadow-lg" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="container">
          <div className="navbar-brand text-white d-flex align-items-center">
            <div className="me-3 p-2 bg-opacity-20 rounded-circle">
              <i className="bi bi-book-half text-white" style={{fontSize: '1.5rem'}}></i>
            </div>
            <div>
              <h4 className="mb-0">Prestamos SF</h4>
              <small className="opacity-75">Sistema digital de Biblioteca</small>
            </div>
          </div>
          <div className="ms-auto d-flex align-items-center">
            <div className="dropdown">
              <button className="btn btn-link text-white text-decoration-none dropdown-toggle d-flex align-items-center" 
                      data-bs-toggle="dropdown" aria-expanded="false">
                <div className="me-3 p-2 bg-opacity-20 rounded-circle">
                  <i className="bi bi-person-circle" style={{fontSize: '1.2rem'}}></i>
                </div>
                <div className="text-start">
                  <div>{user.nombre}</div>
                  <small className="opacity-75">Usuario</small>
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0">
                <li><a className="dropdown-item" href="#"><i className="bi bi-person me-2"></i>Mi Perfil</a></li>
                <li><a className="dropdown-item" href="#"><i className="bi bi-gear me-2"></i>Configuración</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button onClick={handleLogout} className="dropdown-item text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="text-center text-lg-start">
                <h1 className="display-5 fw-bold text-dark mb-3">
                  ¡Bienvenido de vuelta, {user.nombre}! 📚
                </h1>
                <p className="lead text-muted mb-4">
                  Explora nuestra colección digital, gestiona tus préstamos y descubre nuevos materiales de aprendizaje
                </p>
                <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-lg-start">
                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                    <i className="bi bi-check-circle me-1"></i>Acceso 24/7
                  </span>
                  <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                    <i className="bi bi-lightning me-1"></i>Búsqueda Rápida
                  </span>
                  <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                    <i className="bi bi-shield-check me-1"></i>Seguro
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Cards Section Rediseñadas */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {/* Card 1 - Materiales */}
            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-lg h-100 overflow-hidden position-relative" 
                   style={{background: 'linear-gradient(135deg,rgb(56, 108, 250) 0%,rgb(24, 9, 158) 100%)', transform: 'translateY(0)', transition: 'all 0.3s ease'}}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="card-body text-white p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="p-3 bg-opacity-20 rounded-circle">
                      <i className="bi bi-journals" style={{fontSize: '2rem'}}></i>
                    </div>
                    <span className="badge bg-white text-primary">Explorar</span>
                  </div>
                  <h4 className="card-title mb-3">Catálogo Digital</h4>
                  <p className="card-text opacity-90 mb-4">
                    Descubre miles de recursos académicos, libros digitales y materiales especializados
                  </p>
                  <div className="d-flex align-items-center justify-content-between">
                    <small className="opacity-75">
                      <i className="bi bi-collection me-1"></i>+1,500 materiales
                    </small>
                    <button className="btn btn-light btn-sm rounded-pill px-3" 
                            onClick={() => navigate('/materials-management')}>
                      <i className="bi bi-arrow-right me-1"></i>Explorar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Solicitudes */}
            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-lg h-100 overflow-hidden position-relative" 
                   style={{background: 'linear-gradient(135deg,rgb(63, 252, 110) 0%,rgb(15, 138, 4) 100%)', transform: 'translateY(0)', transition: 'all 0.3s ease'}}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="card-body text-white p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="p-3 bg-opacity-20 rounded-circle">
                      <i className="bi bi-file-earmark-plus" style={{fontSize: '2rem'}}></i>
                    </div>
                    <span className="badge bg-white text-primary">Gestionar</span>
                  </div>
                  <h4 className="card-title mb-3">Solicitudes</h4>
                  <p className="card-text opacity-90 mb-4">
                    Solicita materiales y rastrea el estado de tus peticiones en tiempo real
                  </p>
                  <div className="d-grid gap-2">
                    <button className="btn btn-light btn-sm rounded-pill" 
                            onClick={() => navigate('/create-request')}>
                      <i className="bi bi-plus-circle me-1"></i>Nueva Solicitud
                    </button>
                    <button className="btn btn-outline-light btn-sm rounded-pill" 
                            onClick={() => navigate('/my-requests')}>
                      <i className="bi bi-list-ul me-1"></i>Mis Solicitudes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Préstamos */}
            <div className="col-lg-4 col-md-6 mx-auto">
              <div className="card border-0 shadow-lg h-100 overflow-hidden position-relative" 
                   style={{background: 'linear-gradient(135deg,rgb(250, 193, 35) 0%,rgb(172, 100, 6) 100%)', transform: 'translateY(0)', transition: 'all 0.3s ease'}}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="card-body text-white p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="p-3 bg-opacity-20 rounded-circle">
                      <i className="bi bi-bookmark-check" style={{fontSize: '2rem'}}></i>
                    </div>
                    <span className="badge bg-white text-primary">Activos</span>
                  </div>
                  <h4 className="card-title mb-3">Mis Préstamos</h4>
                  <p className="card-text opacity-90 mb-4">
                    Administra tus préstamos activos, fechas de devolución y renovaciones
                  </p>
                  <div className="d-flex align-items-center justify-content-between">
                    <small className="opacity-75">
                      <i className="bi bi-clock me-1"></i>Recordatorios automáticos
                    </small>
                    <button className="btn btn-light btn-sm rounded-pill px-3" 
                            onClick={() => navigate('/client-loans')}>
                      <i className="bi bi-eye me-1"></i>Ver Todo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer renovado */}
      <footer className="py-5 mt-5" style={{background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'}}>
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-3">
                <div className="me-3 p-2 bg-opacity-20 rounded-circle">
                  <i className="bi bi-book-half text-white"></i>
                </div>
                <h5 className="text-white mb-0">Prestamos SF</h5>
              </div>
              <p className="text-white-50 mb-3">
                Conectando conocimiento con tecnología para una experiencia de aprendizaje excepcional.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="text-white-50 hover-text-white"><i className="bi bi-facebook"></i></a>
                <a href="#" className="text-white-50 hover-text-white"><i className="bi bi-twitter"></i></a>
                <a href="#" className="text-white-50 hover-text-white"><i className="bi bi-instagram"></i></a>
                <a href="#" className="text-white-50 hover-text-white"><i className="bi bi-linkedin"></i></a>
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="text-white-50 mb-2">
                <i className="bi bi-envelope me-2"></i>soporte@Prestamos SF.com
              </p>
              <p className="text-white-50 mb-2">
                <i className="bi bi-telephone me-2"></i>+51 999 888 777
              </p>
              <p className="text-white-50 mb-0">
                &copy; 2025 Prestamos SF - Innovando la educación
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .hover-text-white:hover { color: white !important; }
        .card:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important; }
      `}</style>
    </div>
  );
};

export default UserDashboard;