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
  multa?: number;
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
        if (fetchedUserData?.carne_identidad) {
          await fetchMyLoans(fetchedUserData.carne_identidad);
        } else {
          setError('No se pudo obtener el carné de identidad del usuario');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos iniciales.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      const fetchedUserData = response.data;
      console.log(user);
      setUserData(fetchedUserData);
      return fetchedUserData;
    } catch (err: unknown) {
      console.error('Error fetching user data:', err);
      setError('Error al obtener los datos del usuario. Intente nuevamente.');
      throw err;
    }
  };

  const fetchMyLoans = async (carneIdentidad: string) => {
    try {
      const response = await api.get(`/prestamos/cliente/${carneIdentidad}`);
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
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando su historial de préstamos...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-clock-history me-2"></i>
          Mi Historial de Préstamos
        </h2>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/user-dashboard')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Volver al Dashboard
        </button>
      </div>

      {userData && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">
              <i className="bi bi-person me-2"></i>
              Información del Usuario
            </h5>
            <div className="row">
              <div className="col-md-6">
                <p><strong>Nombre:</strong> {userData.nombre}</p>
                <p><strong>Carné:</strong> {userData.carne_identidad}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Dirección:</strong> {userData.direccion}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {prestamos.length > 0 && (
        <>
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card text-center bg-light">
                <div className="card-body">
                  <h5 className="card-title text-primary">Total de Préstamos</h5>
                  <h2 className="text-primary">{prestamos.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center bg-warning bg-opacity-10">
                <div className="card-body">
                  <h5 className="card-title text-warning">Préstamos Activos</h5>
                  <h2 className="text-warning">{activePrestamos}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center bg-success bg-opacity-10">
                <div className="card-body">
                  <h5 className="card-title text-success">Préstamos Devueltos</h5>
                  <h2 className="text-success">{returnedPrestamos}</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Resultados ({filteredPrestamos.length})</h4>
            <div className="btn-group" role="group">
              <input 
                type="radio" 
                className="btn-check" 
                name="filter" 
                id="todos" 
                checked={filter === 'todos'}
                onChange={() => setFilter('todos')}
              />
              <label className="btn btn-outline-primary" htmlFor="todos">
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
                Devueltos ({returnedPrestamos})
              </label>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Material</th>
                  <th>Fecha Préstamo</th>
                  <th>Fecha Límite</th>
                  <th>Fecha Devolución</th>
                  <th>Estado</th>
                  <th>Multa</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrestamos.map((prestamo) => (
                  <tr key={prestamo.id}>
                    <td>{prestamo.id}</td>
                    <td>
                      <div>
                        <strong>{prestamo.titulo}</strong>
                        <br />
                        <small className="text-muted">{prestamo.autor}</small>
                      </div>
                    </td>
                    <td>{new Date(prestamo.fecha_prestamo).toLocaleDateString()}</td>
                    <td>
                      <span className={`${
                        prestamo.estado === 'activo' && new Date(prestamo.fecha_limite) < new Date()
                          ? 'text-danger fw-bold'
                          : ''
                      }`}>
                        {new Date(prestamo.fecha_limite).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      {prestamo.fecha_devolucion 
                        ? new Date(prestamo.fecha_devolucion).toLocaleDateString()
                        : '-'
                      }
                    </td>
                    <td>
                      <span className={`badge ${
                        prestamo.estado === 'activo' ? 'bg-warning' : 'bg-success'
                      }`}>
                        {prestamo.estado.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {prestamo.multa && prestamo.multa > 0 
                        ? `$${prestamo.multa.toFixed(2)}`
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && prestamos.length === 0 && (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No tiene historial de préstamos aún. ¡Solicite materiales para comenzar!
        </div>
      )}
    </div>
  );
};

export default ClientLoans;