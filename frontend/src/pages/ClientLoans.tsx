import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/axiosInstance';

interface Prestamo {
  id: number;
  material_id: number;
  titulo: string;
  autor: string;
  fecha_prestamo: string;
  fecha_limite: string;
  fecha_devolucion?: string;
  estado: 'activo' | 'devuelto';
}

interface User {
  id: number;
  nombre: string;
  carne_identidad: string;
  direccion: string;
  email: string;
  rol: string;
}

const ClientLoans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'todos' | 'activos' | 'devueltos'>('todos');
  const [userData, setUserData] = useState<User | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedUserData = await fetchUserData();
        if (fetchedUserData?.id) {
          await fetchMyLoans(fetchedUserData.id);
        } else {
          setError('No se pudo obtener el ID del usuario');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos iniciales.');
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      const fetchedUserData = response.data;
      console.log(user);
      console.log("Userdata", userData);
      setUserData(fetchedUserData);
      return fetchedUserData;
    } catch (err: unknown) {
      console.error('Error fetching user data:', err);
      setError('Error al obtener los datos del usuario. Intente nuevamente.');
      throw err;
    }
  };
  const fetchMyLoans = async (userId: number) => {
    try {
      const response = await api.get(`/prestamos/cliente/${userId}`);
      setPrestamos(response.data);
    } catch (err) {
      console.error('Error fetching loans:', err);
      setError('Error al cargar su historial de préstamos.');
      setPrestamos([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrestamos = prestamos.filter(prestamo => {
    if (filter === 'activos') return prestamo.estado === 'activo';
    if (filter === 'devueltos') return prestamo.estado === 'devuelto';
    return true; // 'todos'
  });

  const activePrestamos = prestamos.filter(p => p.estado === 'activo').length;
  const returnedPrestamos = prestamos.filter(p => p.estado === 'devuelto').length;

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando su historial de préstamos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container py-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-outline-secondary btn-sm me-2" 
                onClick={() => navigate('/user-dashboard')}
                title="Volver"
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <div>
                <h5 className="mb-0">Mi Historial de Préstamos</h5>
                <small className="text-muted">Consulta tus préstamos y devoluciones</small>
              </div>
            </div>
            
            {prestamos.length > 0 && (
              <div className="d-flex gap-3">
                <div className="text-center">
                  <div className="fw-bold text-primary small">{prestamos.length}</div>
                  <small className="text-muted" style={{fontSize: '0.75rem'}}>Total</small>
                </div>
                <div className="text-center">
                  <div className="fw-bold text-warning small">{activePrestamos}</div>
                  <small className="text-muted" style={{fontSize: '0.75rem'}}>Activos</small>
                </div>
                <div className="text-center">
                  <div className="fw-bold text-success small">{returnedPrestamos}</div>
                  <small className="text-muted" style={{fontSize: '0.75rem'}}>Devueltos</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      {prestamos.length > 0 && (
        <div className="bg-white border-bottom">
          <div className="container py-2">
            <div className="d-flex justify-content-between align-items-center">
              <div className="btn-group btn-group-sm" role="group">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="filter" 
                  id="todos" 
                  checked={filter === 'todos'}
                  onChange={() => setFilter('todos')}
                />
                <label className="btn btn-outline-primary" htmlFor="todos">
                  <i className="bi bi-collection me-1"></i>
                  Todos ({prestamos.length})
                </label>

                <input 
                  type="radio" 
                  className="btn-check" 
                  name="filter" 
                  id="activos" 
                  checked={filter === 'activos'}
                  onChange={() => setFilter('activos')}
                />
                <label className="btn btn-outline-warning" htmlFor="activos">
                  <i className="bi bi-clock me-1"></i>
                  Activos ({activePrestamos})
                </label>

                <input 
                  type="radio" 
                  className="btn-check" 
                  name="filter" 
                  id="devueltos" 
                  checked={filter === 'devueltos'}
                  onChange={() => setFilter('devueltos')}
                />
                <label className="btn btn-outline-success" htmlFor="devueltos">
                  <i className="bi bi-check-circle me-1"></i>
                  Devueltos ({returnedPrestamos})
                </label>
              </div>
              
              <small className="text-muted">
                {filteredPrestamos.length} préstamo{filteredPrestamos.length !== 1 ? 's' : ''}
              </small>
            </div>
          </div>
        </div>
      )}

      <div className="container py-3">
        {error && (
          <div className="alert alert-danger alert-dismissible" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {prestamos.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-clock-history display-1 text-muted mb-3"></i>
            <h5>No tienes préstamos</h5>
            <p className="text-muted mb-3">¡Solicita materiales para comenzar tu historial!</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/create-request')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Solicitar material
            </button>
          </div>
        ) : (
          <>
            {/* Cards para móvil */}
            <div className="d-md-none">
              {filteredPrestamos.map((prestamo) => (
                <div key={prestamo.id} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">Préstamo #{prestamo.id}</h6>
                      <span className={`badge ${
                        prestamo.estado === 'activo' ? 'bg-warning' : 'bg-success'
                      }`}>
                        {prestamo.estado.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="fw-medium">{prestamo.titulo}</div>
                      <small className="text-muted">{prestamo.autor}</small>
                    </div>
                    
                    <div className="row g-2">
                      <div className="col-6">
                        <small className="text-muted">
                          <i className="bi bi-calendar-plus me-1"></i>
                          Préstamo: {new Date(prestamo.fecha_prestamo).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="col-6">
                        <small className={`${
                          prestamo.estado === 'activo' && new Date(prestamo.fecha_limite) < new Date()
                            ? 'text-danger fw-bold'
                            : 'text-muted'
                        }`}>
                          <i className="bi bi-calendar-x me-1"></i>
                          Límite: {new Date(prestamo.fecha_limite).toLocaleDateString()}
                        </small>
                      </div>                      {prestamo.fecha_devolucion && (
                        <div className="col-6">
                          <small className="text-muted">
                            <i className="bi bi-calendar-check me-1"></i>
                            Devuelto: {new Date(prestamo.fecha_devolucion).toLocaleDateString()}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla para desktop */}
            <div className="d-none d-md-block">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">                      <thead className="table-light">
                        <tr>
                          <th style={{width: '80px'}}>ID</th>
                          <th style={{width: '35%'}}>Material</th>
                          <th style={{width: '15%'}}>Préstamo</th>
                          <th style={{width: '15%'}}>Límite</th>
                          <th style={{width: '15%'}}>Devolución</th>
                          <th style={{width: '15%'}}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPrestamos.map((prestamo) => (
                          <tr key={prestamo.id}>
                            <td>
                              <span className="badge bg-light text-dark">#{prestamo.id}</span>
                            </td>
                            <td>
                              <div className="text-truncate" style={{maxWidth: '250px'}}>
                                <div className="fw-medium" title={prestamo.titulo}>
                                  {prestamo.titulo}
                                </div>
                                <small className="text-muted" title={prestamo.autor}>
                                  {prestamo.autor}
                                </small>
                              </div>
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date(prestamo.fecha_prestamo).toLocaleDateString()}
                              </small>
                            </td>
                            <td>
                              <small className={`${
                                prestamo.estado === 'activo' && new Date(prestamo.fecha_limite) < new Date()
                                  ? 'text-danger fw-bold'
                                  : 'text-muted'
                              }`}>
                                {new Date(prestamo.fecha_limite).toLocaleDateString()}
                                {prestamo.estado === 'activo' && new Date(prestamo.fecha_limite) < new Date() && (
                                  <i className="bi bi-exclamation-triangle ms-1"></i>
                                )}
                              </small>
                            </td>
                            <td>
                              <small className="text-muted">
                                {prestamo.fecha_devolucion 
                                  ? new Date(prestamo.fecha_devolucion).toLocaleDateString()
                                  : '-'
                                }
                              </small>
                            </td>                            <td>
                              <span className={`badge ${
                                prestamo.estado === 'activo' ? 'bg-warning' : 'bg-success'
                              }`}>
                                {prestamo.estado.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientLoans;