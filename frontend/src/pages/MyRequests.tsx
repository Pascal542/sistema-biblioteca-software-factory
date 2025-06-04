import { useState, useEffect } from 'react';
import api from '../services/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MaterialDetailModal from '../components/MaterialDetailModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

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

interface Material {
  identificador?: string;
  titulo: string;
  autor: string;
  anio_publicacion?: number;
  anio_llegada?: number;
  editorial?: string;
  cantidad_total?: number;
  cantidad_prestamo?: number;
  id: number;
  tipo: string;
  factor_estancia?: number;
  estado?: string;
  activo?: boolean;
}

interface PaginationInfo {
  total: number;
  page: number;
  size: number;
  pages: number;
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
  const [materialTitles, setMaterialTitles] = useState<Record<number, string>>({});
  const [currentMaterialId, setCurrentMaterialId] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    size: 7,
    pages: 1
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedUserData = await fetchUserData();
        
        if (fetchedUserData?.carne_identidad) {
          await fetchMySolicitudes(fetchedUserData, 1);
        } else {
          console.error('No se pudo obtener carne_identidad del usuario');
          setError('No se pudo obtener el carnet de identidad del usuario');
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
      console.log('User data fetched:', fetchedUserData);
      console.log(user);
      setUserData(fetchedUserData);
      return fetchedUserData;
    } catch (err: unknown) {
      console.error('Error fetching user data:', err);
      setError('Error al obtener los datos del usuario. Intente nuevamente.');
      throw err;
    }
  };
  
  const fetchMySolicitudes = async (userDataParam?: User, page: number = 1) => {
    try {
      const currentUserData = userDataParam || userData;
      
      if (!currentUserData?.carne_identidad) {
        console.error('No se pudo obtener el carnet de identidad del usuario');
        setError('No se pudo obtener el carnet de identidad del usuario');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        size: '7'
      });

      const url = `/solicitudes/usuario-dni/${currentUserData.carne_identidad}?${params}`;
      const response = await api.get(url);
      
      if (response.data && response.data.data && response.data.pagination) {
        const solicitudesData = response.data.data || [];
        setSolicitudes(solicitudesData);
        setPagination(response.data.pagination);
        
        const materialIds = solicitudesData
          .map((solicitud: MaterialSolicitud) => solicitud.material_id)
          .filter((id: number) => id !== undefined && id !== null);

        const uniqueIds = [...new Set(materialIds)] as number[];
        
        const idsToFetch = uniqueIds.filter(id => !materialTitles[id]);
        
        if (idsToFetch.length > 0) {
          await fetchMaterialTitles(idsToFetch);
        }
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
      
    } catch (err) {
      console.error('Error en fetchMySolicitudes:', err);
      setError('Error al cargar sus solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialTitles = async (materialIds: number[]) => {
    try {
      const newTitles = {...materialTitles};
      
      for (const id of materialIds) {
        try {
          const response = await api.get(`/materiales/${id}`);
          
          if (response.data && response.data.titulo) {
            newTitles[id] = `${response.data.titulo}`;
          }
        } catch (error) {
          console.error(`Error fetching material ${id}:`, error);
          newTitles[id] = `Material #${id}`;
        }
      }
      
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
      
      // Refresh current page after cancellation
      fetchMySolicitudes(userData || undefined, pagination.page);
    } catch (err) {
      console.error('Error cancelling request:', err);
      setError('Error al cancelar la solicitud.');
    } finally {
      setCancellingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages && newPage !== pagination.page) {
      setLoading(true);
      fetchMySolicitudes(userData || undefined, newPage);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const currentPage = pagination.page;
    const totalPages = pagination.pages;
    
    // Previous button
    buttons.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <i className="bi bi-chevron-left"></i>
        </button>
      </li>
    );

    // Page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 4);
      }
    }

    if (startPage > 1) {
      buttons.push(
        <li key={1} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
        </li>
      );
      if (startPage > 2) {
        buttons.push(
          <li key="dots1" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
          <button 
            className="page-link"
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        </li>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <li key="dots2" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
      buttons.push(
        <li key={totalPages} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </button>
        </li>
      );
    }

    // Next button
    buttons.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </li>
    );

    return buttons;
  };

  const handleShowMaterialDetails = (materialId: number) => {
    setCurrentMaterialId(materialId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentMaterialId(null);
  };

  const handleMaterialUpdate = (material: Material) => {
    // Update material titles cache when modal loads material data
    if (material.titulo && material.tipo) {
      setMaterialTitles(prev => ({
        ...prev,
        [material.id]: `${material.titulo} (${material.tipo})`
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando sus solicitudes...</p>
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
                <h5 className="mb-0">Mis Solicitudes</h5>
                <small className="text-muted">Gestiona tus solicitudes de materiales</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <small className="text-muted">
                {pagination.total} solicitud{pagination.total !== 1 ? 'es' : ''}
              </small>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/create-request')}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Nueva Solicitud
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-3">
        {error && (
          <div className="alert alert-danger alert-dismissible" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
        
        {solicitudes.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-list-ul display-1 text-muted mb-3"></i>
            <h5>No tienes solicitudes</h5>
            <p className="text-muted mb-3">¡Crea una nueva solicitud para comenzar!</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/create-request')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Crear primera solicitud
            </button>
          </div>
        ) : (
          <>
            {/* Cards para móvil */}
            <div className="d-md-none">
              {solicitudes.map((solicitud) => (
                <div key={solicitud.id} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">Solicitud #{solicitud.id}</h6>
                      <span className={`badge ${
                        solicitud.estado === 'pendiente' ? 'bg-warning' : 
                        solicitud.estado === 'aprobada' ? 'bg-success' : 
                        solicitud.estado === 'rechazada' ? 'bg-danger' : 'bg-secondary'
                      }`}>
                        {solicitud.estado.toUpperCase()}
                      </span>
                    </div>
                    
                    <button 
                      className="btn btn-link p-0 text-start text-decoration-none mb-2"
                      onClick={() => handleShowMaterialDetails(solicitud.material_id)}
                    >
                      <i className="bi bi-book me-1"></i>
                      <small>{materialTitles[solicitud.material_id] || `Material #${solicitud.material_id}`}</small>
                    </button>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                      </small>
                      {solicitud.estado === 'pendiente' && (
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancelRequest(solicitud.id)}
                          disabled={cancellingId === solicitud.id}
                        >
                          {cancellingId === solicitud.id ? (
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Cancelando...</span>
                          </div>
                          ) : (
                          'Cancelar'
                          )}
                        </button>
                      )}
                    </div>
                    
                    {solicitud.observaciones && (
                      <div className="mt-2">
                        <small className="text-muted">
                          <strong>Observaciones:</strong> {solicitud.observaciones}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla para desktop */}
            <div className="d-none d-md-block">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{width: '10%'}}>Número</th>
                          <th style={{width: '30%'}}>Material</th>
                          <th style={{width: '15%'}}>Fecha</th>
                          <th style={{width: '15%'}}>Estado</th>
                          <th style={{width: '20%'}}>Observaciones</th>
                          <th style={{width: '10%'}}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudes.map((solicitud) => (
                          <tr key={solicitud.id}>
                            <td>
                              <span className="badge bg-light text-dark">#{solicitud.id}</span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-link p-0 text-start text-decoration-none"
                                onClick={() => handleShowMaterialDetails(solicitud.material_id)}
                              >
                                <span className="text-truncate d-inline-block" style={{maxWidth: '300px'}} title={materialTitles[solicitud.material_id] || `Material #${solicitud.material_id}`}>
                                  {materialTitles[solicitud.material_id] || `Material #${solicitud.material_id}`}
                                </span>
                              </button>
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                              </small>
                            </td>
                            <td>
                              <span className={`badge ${
                                solicitud.estado === 'pendiente' ? 'bg-warning' : 
                                solicitud.estado === 'aprobada' ? 'bg-success' : 
                                solicitud.estado === 'rechazada' ? 'bg-danger' : 'bg-secondary'
                              }`}>
                                {solicitud.estado.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div className="text-truncate" style={{maxWidth: '150px'}} title={solicitud.observaciones || '-'}>
                                {solicitud.observaciones || '-'}
                              </div>
                            </td>
                            <td>
                              {solicitud.estado === 'pendiente' && (
                                <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancelRequest(solicitud.id)}
                          disabled={cancellingId === solicitud.id}
                        >
                          {cancellingId === solicitud.id ? (
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Cancelando...</span>
                          </div>
                          ) : (
                          'Cancelar'
                          )}
                        </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">
                  Página {pagination.page} de {pagination.pages} - Mostrando {solicitudes.length} de {pagination.total} solicitudes
                </small>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    {renderPaginationButtons()}
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para detalles del material */}
      <MaterialDetailModal
        show={showModal}
        materialId={currentMaterialId}
        onClose={handleCloseModal}
        onMaterialUpdate={handleMaterialUpdate}
      />
    </div>
  );
};

export default MyRequests;