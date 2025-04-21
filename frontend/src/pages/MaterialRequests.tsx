import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Solicitud {
  id: number;
  nombre_usuario: string;
  carne_identidad: string;
  direccion_usuario: string;
  material_id: number;
  titulo_material?: string;
  fecha_solicitud: string;
  estado: string;
  observaciones?: string;
}

const MaterialRequests = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [showObservacionesModal, setShowObservacionesModal] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<'aprobar' | 'rechazar' | null>(null);

  useEffect(() => {
    fetchSolicitudes();
  }, [filterEstado]);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/solicitudes';
      if (filterEstado) {
        url += `?estado=${filterEstado}`;
      }
      
      const response = await axios.get(url);
      
      const solicitudesData = response.data;
      const materialesIds = solicitudesData.map((s: Solicitud) => s.material_id);
      
      if (materialesIds.length > 0) {
        try {
          const materialesPromises = materialesIds.map((id: number) => 
            axios.get(`/api/materiales/${id}`).catch(() => ({ data: null }))
          );
          
          const materialesResponses = await Promise.all(materialesPromises);
          
          const solicitudesConTitulos = solicitudesData.map((solicitud: Solicitud, index: number) => {
            const materialData = materialesResponses[index].data;
            return {
              ...solicitud,
              titulo_material: materialData ? materialData.titulo : `Material #${solicitud.material_id}`
            };
          });
          
          setSolicitudes(solicitudesConTitulos);
        } catch (err) {
          console.error('Error fetching material details:', err);
          setSolicitudes(solicitudesData);
        }
      } else {
        setSolicitudes(solicitudesData);
      }
    } catch (err) {
      console.error('Error fetching solicitudes:', err);
      setError('Error al cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  const openObservacionesModal = (solicitudId: number, action: 'aprobar' | 'rechazar') => {
    setSelectedSolicitudId(solicitudId);
    setSelectedAction(action);
    setObservaciones('');
    setShowObservacionesModal(true);
  };

  const closeObservacionesModal = () => {
    setShowObservacionesModal(false);
    setSelectedSolicitudId(null);
    setSelectedAction(null);
    setObservaciones('');
  };

  const handleProcessSolicitud = async () => {
    if (!selectedSolicitudId || !selectedAction) return;
    
    setProcessingId(selectedSolicitudId);
    try {
      await axios.put(`/api/solicitudes/${selectedSolicitudId}`, {
        estado: selectedAction === 'aprobar' ? 'aprobada' : 'rechazada',
        observaciones: observaciones || undefined
      });
      
      // Actualizar la lista
      fetchSolicitudes();
      closeObservacionesModal();
    } catch (err) {
      console.error(`Error ${selectedAction === 'aprobar' ? 'aprobando' : 'rechazando'} solicitud:`, err);
      setError(`Error al ${selectedAction === 'aprobar' ? 'aprobar' : 'rechazar'} la solicitud.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && solicitudes.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando solicitudes...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-file-earmark-text me-2"></i>
          Gestión de Solicitudes de Materiales
        </h2>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/admin-dashboard')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Volver al Dashboard
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      
      <div className="card mb-4">
        <div className="card-header bg-light">
          <div className="row align-items-center">
            <div className="col">
              <h5 className="mb-0">Filtros</h5>
            </div>
            <div className="col-md-4">
              <select 
                className="form-select form-select-sm"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobada">Aprobadas</option>
                <option value="rechazada">Rechazadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>
            <div className="col-auto">
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => fetchSolicitudes()}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refrescar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {solicitudes.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay solicitudes{filterEstado ? ` en estado "${filterEstado}"` : ''}.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Carné</th>
                <th>Dirección</th>
                <th>Material</th>
                <th>Fecha Solicitud</th>
                <th>Estado</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>{solicitud.id}</td>
                  <td>{solicitud.nombre_usuario}</td>
                  <td>{solicitud.carne_identidad}</td>
                  <td>{solicitud.direccion_usuario}</td>
                  <td>{solicitud.titulo_material || `Material #${solicitud.material_id}`}</td>
                  <td>{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${
                      solicitud.estado === 'pendiente' ? 'bg-warning' : 
                      solicitud.estado === 'aprobada' ? 'bg-success' : 
                      solicitud.estado === 'rechazada' ? 'bg-danger' :
                      solicitud.estado === 'cancelada' ? 'bg-secondary' : 'bg-info'
                    }`}>
                      {solicitud.estado.toUpperCase()}
                    </span>
                  </td>
                  <td>{solicitud.observaciones || '-'}</td>
                  <td>
                    {solicitud.estado === 'pendiente' && (
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-success"
                          onClick={() => openObservacionesModal(solicitud.id, 'aprobar')}
                          disabled={processingId === solicitud.id}
                        >
                          {processingId === solicitud.id ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="bi bi-check-circle"></i>
                          )}
                          {' '}Aprobar
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => openObservacionesModal(solicitud.id, 'rechazar')}
                          disabled={processingId === solicitud.id}
                        >
                          {processingId === solicitud.id ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="bi bi-x-circle"></i>
                          )}
                          {' '}Rechazar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal para observaciones */}
      {showObservacionesModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedAction === 'aprobar' ? 'Aprobar' : 'Rechazar'} Solicitud
                </h5>
                <button type="button" className="btn-close" onClick={closeObservacionesModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="observaciones" className="form-label">Observaciones (opcional)</label>
                  <textarea
                    id="observaciones"
                    className="form-control"
                    rows={4}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder={`Añada comentarios sobre la ${selectedAction === 'aprobar' ? 'aprobación' : 'razón del rechazo'}...`}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeObservacionesModal}>
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className={`btn ${selectedAction === 'aprobar' ? 'btn-success' : 'btn-danger'}`}
                  onClick={handleProcessSolicitud}
                  disabled={processingId !== null}
                >
                  {processingId !== null ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : selectedAction === 'aprobar' ? (
                    <i className="bi bi-check-circle me-2"></i>
                  ) : (
                    <i className="bi bi-x-circle me-2"></i>
                  )}
                  {selectedAction === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequests;