import { useState, useEffect } from 'react';
import api from '../services/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface MaterialSolicitud {
  id: number;
  material_id: number;
  titulo_material?: string;
  fecha_solicitud: string;
  estado: string;
  observaciones?: string;
}

interface User {
  id: number;
  nombre: string;
  carne_identidad: string;
  direccion: string;
  email: string;
  rol: string;
}

interface MaterialDetalle {
  identificador: string;
  titulo: string;
  autor: string;
  anio_publicacion: number;
  anio_llegada: number;
  editorial: string;
  cantidad_total: number;
  cantidad_prestamo: number;
  id: number;
  tipo: string;
  factor_estancia: number;
}


const MyRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<MaterialSolicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDetalle | null>(null);
  const [loadingMaterial, setLoadingMaterial] = useState(false);
  const [materialTitles, setMaterialTitles] = useState<Record<number, string>>({});
  const [currentMaterialId, setCurrentMaterialId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUserData();
        // Cargar solicitudes inmediatamente después de obtener datos del usuario
        await fetchMySolicitudes();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos iniciales.');
      }
    };

    fetchData();
  }, []);

  // Remover el segundo useEffect que dependía de userData
  // useEffect(() => {
  //   if (userData?.carne_identidad) {
  //     fetchMySolicitudes();
  //   }
  // }, [userData]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      setUserData(response.data);
    } catch (err: unknown) {
      console.error('Error fetching user data:', err);
      setError('Error al obtener los datos del usuario. Intente nuevamente.');
    }
  };

  const fetchMySolicitudes = async () => {
    try {
      // Usar el email del usuario autenticado en lugar de carne_identidad
      if (!user?.email) {
        setError('Usuario no autenticado');
        return;
      }

      // Usar el endpoint correcto que busca por email
      const response = await api.get(`/solicitudes/usuario-email/${user.email}`);
      
      // La respuesta es paginada, así que usar response.data.data
      const solicitudesData = response.data.data || [];
      setSolicitudes(solicitudesData);
      
      const materialIds = solicitudesData
        .map((solicitud: MaterialSolicitud) => solicitud.material_id)
        .filter((id: number) => id !== undefined && id !== null);

      const uniqueIds = [...new Set(materialIds)] as number[];
      console.log("Material IDs encontrados:", uniqueIds);
      const idsToFetch = uniqueIds.filter(id => !materialTitles[id]);
      
      if (idsToFetch.length > 0) {
        await fetchMaterialTitles(idsToFetch);
      }
    } catch (err) {
      console.error('Error fetching solicitudes:', err);
      setError('Error al cargar sus solicitudes.');
    } finally {
      setLoading(false);
    }
  };


  const fetchMaterialTitles = async (materialIds: number[]) => {
    try {
      const newTitles = {...materialTitles};
      console.log("Fetching titles for materials:", materialIds);
      
      for (const id of materialIds) {
        try {
          const response = await api.get(`/materiales/${id}`);
          console.log(`Material ${id} response:`, response.data);
          
          if (response.data && response.data.titulo) {
            if (response.data.id === id) {
              newTitles[id] = `${response.data.titulo} (${response.data.tipo})`;
            } else {
              console.warn(`ID mismatch: requested ${id}, received ${response.data.id}`);
              newTitles[id] = `${response.data.titulo} (${response.data.tipo})`;
            }
          }
        } catch (error) {
          console.error(`Error fetching material ${id}:`, error);
          newTitles[id] = `Material #${id}`;
        }
      }
      
      console.log("Updated titles:", newTitles);
      setMaterialTitles(newTitles);
    } catch (error) {
      console.error('Error fetching material titles:', error);
    }
  };

  const handleCancelRequest = async (id: number) => {
    if (!confirm('¿Está seguro que desea cancelar esta solicitud?')) {
      return;
    }
    
    setCancellingId(id);
    try {
      await api.put(`/solicitudes/${id}`, {
        estado: 'cancelada',
        observaciones: 'Cancelada por el usuario'
      });
      
      fetchMySolicitudes();
    } catch (err) {
      console.error('Error cancelling request:', err);
      setError('Error al cancelar la solicitud.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleShowMaterialDetails = async (materialId: number) => {
    setLoadingMaterial(true);
    setShowModal(true);
    setSelectedMaterial(null);
    setCurrentMaterialId(materialId);
    
    console.log("Cargando materiales de  ID:", materialId);
    
    try {
      const response = await api.get(`/materiales/${materialId}`);
      console.log("Material details recivido:", response.data);
      
      if (response.data) {
        if (response.data.id !== materialId) {
          console.warn(`no ID en details: Se esperaba ${materialId}, tiene ${response.data.id}`);
        }
        
        setSelectedMaterial(response.data);
        
        if (response.data.titulo) {
          setMaterialTitles(prev => ({
            ...prev,
            [materialId]: `${response.data.titulo} (${response.data.tipo})`
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching material details:', err);
      setError('No se pudo obtener la información detallada del material.');
    } finally {
      setLoadingMaterial(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMaterial(null);
    setCurrentMaterialId(null);
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando sus solicitudes...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-list-ul me-2"></i>
          Mis Solicitudes de Materiales
        </h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/create-request')}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Solicitud
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      
      {solicitudes.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No tiene solicitudes de materiales. ¡Cree una nueva solicitud!
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Material</th>
                <th>Fecha de Solicitud</th>
                <th>Estado</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>{solicitud.id}</td>
                  <td>
                    <a 
                      href="#" 
                      className="text-primary text-decoration-none" 
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("Clicked on material ID:", solicitud.material_id);
                        handleShowMaterialDetails(solicitud.material_id);
                      }}
                    >
                      <i className="bi bi-info-circle me-1"></i>
                      ID: {solicitud.material_id} - {materialTitles[solicitud.material_id] || `Material #${solicitud.material_id}`}
                    </a>
                  </td>
                  <td>{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${
                      solicitud.estado === 'pendiente' ? 'bg-warning' : 
                      solicitud.estado === 'aprobada' ? 'bg-success' : 
                      solicitud.estado === 'rechazada' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {solicitud.estado.toUpperCase()}
                    </span>
                  </td>
                  <td>{solicitud.observaciones || '-'}</td>
                  <td>
                    {solicitud.estado === 'pendiente' && (
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancelRequest(solicitud.id)}
                        disabled={cancellingId === solicitud.id}
                      >
                        {cancellingId === solicitud.id ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className="bi bi-x-circle"></i>
                        )}
                        {' '}Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-3">
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/user-dashboard')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Volver al Dashboard
        </button>
      </div>

      {/* Modal para mostrar detalles del material*/}
      <div className={`modal fade ${showModal ? 'show' : ''}`} 
           id="materialDetailModal" 
           tabIndex={-1} 
           aria-labelledby="materialDetailModalLabel" 
           aria-hidden={!showModal}
           style={{display: showModal ? 'block' : 'none'}}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="materialDetailModalLabel">
                <i className="bi bi-book me-2"></i>
                Detalles del Material {currentMaterialId && `(ID: ${currentMaterialId})`}
              </h5>
              <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {loadingMaterial ? (
                <div className="text-center my-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2">Cargando información del material...</p>
                </div>
              ) : selectedMaterial ? (
                <div>
                  <div className="mb-3 p-3 bg-light rounded">
                    <h4>{selectedMaterial.titulo}</h4>
                    <p className="text-muted mb-0">
                      <strong>Autor:</strong> {selectedMaterial.autor}
                    </p>
                    <p className="text-muted mb-0">
                      <strong>ID API:</strong> {selectedMaterial.id}
                    </p>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <dl>
                        <dt>Tipo</dt>
                        <dd>{selectedMaterial.tipo}</dd>
                        
                        <dt>Identificador</dt>
                        <dd>{selectedMaterial.identificador}</dd>
                        
                        <dt>Editorial</dt>
                        <dd>{selectedMaterial.editorial}</dd>
                      </dl>
                    </div>
                    <div className="col-md-6">
                      <dl>
                        <dt>Año de Publicación</dt>
                        <dd>{selectedMaterial.anio_publicacion}</dd>
                        
                        <dt>Año de Llegada</dt>
                        <dd>{selectedMaterial.anio_llegada}</dd>
                        
                        <dt>Factor de Estancia</dt>
                        <dd>{selectedMaterial.factor_estancia}</dd>
                      </dl>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-light rounded">
                    <h5>Disponibilidad</h5>
                    <div className="d-flex justify-content-between">
                      <span>
                        <strong>Total:</strong> {selectedMaterial.cantidad_total}
                      </span>
                      <span>
                        <strong>En préstamo:</strong> {selectedMaterial.cantidad_prestamo}
                      </span>
                      <span>
                        <strong>Disponibles:</strong> {selectedMaterial.cantidad_total - selectedMaterial.cantidad_prestamo}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">
                  No se pudo cargar la información del material.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showModal && (
        <div className="modal-backdrop fade show" onClick={handleCloseModal}></div>
      )}
    </div>
  );
};

export default MyRequests;