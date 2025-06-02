import { useState, useEffect } from 'react';
import api from '../services/axiosInstance';
import { useNavigate } from 'react-router-dom';

interface Solicitud {
  id: number;
  usuario_id: number;
  nombre_usuario?: string;
  carne_identidad?: string;
  direccion_usuario?: string;
  material_id: number;
  titulo_material?: string;
  fecha_solicitud: string;
  estado: string;
  observaciones?: string;
  activo: boolean;
}

interface ClienteDetalle {
  nombre: string;
  carne: string;
  direccion: string;
  prestamos_activos: number;
  materiales_prestados: PrestamoDetalle[];
  historial_prestamos: number;
}

interface PrestamoDetalle {
  material_titulo: string;
  fecha_devolucion_esperada: string;
  overdue: boolean;
}

interface PaginationData {
  total: number;
  page: number;
  size: number;
  pages: number;
}

const MaterialRequests = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [showObservacionesModal, setShowObservacionesModal] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<'aprobar' | 'rechazar' | null>(null);
  
  // New pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    size: 10,
    pages: 1
  });
  
  // New states for client detail modal
  const [showClientModal, setShowClientModal] = useState(false);
  const [clienteDetalle, setClienteDetalle] = useState<ClienteDetalle | null>(null);
  const [loadingCliente, setLoadingCliente] = useState(false);
  
  // New states for observation modal
  const [showObservacionModal, setShowObservacionModal] = useState(false);
  const [selectedObservacion, setSelectedObservacion] = useState<string>('');


  interface ClienteData {
    nombre: string;
    carne_identidad: string;
    direccion: string;
  }

  const [clientesData, setClientesData] = useState<Record<number, ClienteData>>({});

  useEffect(() => {
    const isInitialLoad = solicitudes.length === 0;
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingPage(true);
    }
    fetchSolicitudes();
  }, [filterEstado, currentPage, pageSize]);

  const fetchSolicitudes = async () => {
    const isInitialLoad = solicitudes.length === 0;
    if (!isInitialLoad) {
      setLoadingPage(true);
    }
    setError('');
    
    try {
      console.log(clientesData);
      let url = `/solicitudes?page=${currentPage}&size=${pageSize}`;
      if (filterEstado) {
        url += `&estado=${filterEstado}`;
      }
      
      const response = await api.get(url);
      
      // Handle the paginated response structure
      const responseData = response.data;
      let solicitudesData = [];
      let paginationData = null;
      
      // Check if response has pagination structure
      if (responseData && typeof responseData === 'object') {
        if (Array.isArray(responseData.data) && responseData.pagination) {
          solicitudesData = responseData.data;
          paginationData = responseData.pagination;
        } else if (Array.isArray(responseData.solicitudes) && responseData.pagination) {
          solicitudesData = responseData.solicitudes;
          paginationData = responseData.pagination;
        } else if (Array.isArray(responseData)) {
          // Fallback for non-paginated response
          solicitudesData = responseData;
        } else {
          console.error('Unexpected response structure:', responseData);
          setError('Error: Estructura de respuesta inesperada del servidor.');
          setSolicitudes([]);
          return;
        }
      }
      
      // Update pagination state
      if (paginationData) {
        setPagination(paginationData);
      } else {
        // Fallback pagination for non-paginated responses
        setPagination({
          total: solicitudesData.length,
          page: 1,
          size: solicitudesData.length,
          pages: 1
        });
      }
      
      // Ensure we have an array
      if (!Array.isArray(solicitudesData)) {
        console.error('Response is not an array:', solicitudesData);
        setError('Error: Los datos recibidos no tienen el formato esperado.');
        setSolicitudes([]);
        return;
      }

      // Extract unique user IDs
      const userIds = [...new Set(solicitudesData.map((s: Solicitud) => s.usuario_id))];
      
      // Fetch user details for all unique user IDs in parallel
      const usersPromises = userIds.map((userId: number) => 
        api.get(`/usuarios/${userId}`).catch(() => ({ data: null }))
      );
      
      // Fetch material details in parallel
      const materialesIds = [...new Set(solicitudesData.map((s: Solicitud) => s.material_id))];
      const materialesPromises = materialesIds.map((id: number) => 
        api.get(`/materiales/${id}`).catch(() => ({ data: null }))
      );
      
      // Execute both user and material requests in parallel
      const [usersResponses, materialesResponses] = await Promise.all([
        Promise.all(usersPromises),
        Promise.all(materialesPromises)
      ]);
      
      interface UserData {
        nombre: string;
        carne_identidad: string;
        direccion: string;
      }
      const usersData: Record<number, UserData> = {};
      interface MaterialData {
        titulo: string;
        // Add other fields returned by the API for materials if necessary
      }
      const materialesData: Record<number, MaterialData> = {};
      
      usersResponses.forEach((response, index) => {
        if (response.data) {
          usersData[userIds[index]] = response.data;
        }
      });
      
      materialesResponses.forEach((response, index) => {
        if (response.data) {
          materialesData[materialesIds[index]] = response.data;
        }
      });
      
      setClientesData(usersData);
      
      // Map solicitudes with user and material data
      const solicitudesConTitulos = solicitudesData.map((solicitud: Solicitud) => {
        const materialData = materialesData[solicitud.material_id];
        const userData = usersData[solicitud.usuario_id];
        return {
          ...solicitud,
          titulo_material: materialData ? materialData.titulo : `Material #${solicitud.material_id}`,
          nombre_usuario: userData?.nombre || `Usuario #${solicitud.usuario_id}`,
          carne_identidad: userData?.carne_identidad || '',
          direccion_usuario: userData?.direccion || ''
        };
      });
      
      setSolicitudes(solicitudesConTitulos);
    } catch (err) {
      console.error('Error fetching solicitudes:', err);
      setError('Error al cargar las solicitudes.');
      setSolicitudes([]);
    } finally {
      setLoading(false);
      setLoadingPage(false);
    }
  };

  const fetchClienteDetalle = async (userId: number, carne?: string, nombre?: string, direccion?: string) => {
    setLoadingCliente(true);
    try {
      let userDetails = { nombre: nombre || '', carne: carne || '', direccion: direccion || '' };
      
      // Get user details by user ID
      try {
        const userResponse = await api.get(`/usuarios/${userId}`);
        if (userResponse.data) {
          userDetails = {
            nombre: userResponse.data.nombre || nombre || `Usuario #${userId}`,
            carne: userResponse.data.carne_identidad || carne || '',
            direccion: userResponse.data.direccion || direccion || ''
          };
        }
      } catch {
        console.log('Could not fetch user details, using provided data');
      }

      // Fetch client's active loans and history using carne_identidad
      let prestamosData = [];
      if (userDetails.carne) {
        try {
          const prestamosResponse = await api.get(`/prestamos?usuario=${userDetails.carne}`);
          const responseData = prestamosResponse.data;
          
          // Handle nested response structure
          if (responseData && typeof responseData === 'object') {
            if (Array.isArray(responseData.data)) {
              prestamosData = responseData.data;
            } else if (Array.isArray(responseData.prestamos)) {
              prestamosData = responseData.prestamos;
            } else if (Array.isArray(responseData)) {
              prestamosData = responseData;
            } else {
              prestamosData = [];
            }
          }
          
          if (!Array.isArray(prestamosData)) {
            prestamosData = [];
          }
        } catch (err) {
          console.error('Error fetching prestamos:', err);
          prestamosData = [];
        }
      }
      
      interface Prestamo {
        estado: string;
        material_id: number;
        fecha_devolucion_esperada: string;
        fecha_devolucion_real: string | null;
      }

      const prestamosActivos = prestamosData.filter((p: Prestamo) => 
        p.estado === 'activo' || p.estado === 'Activo'
      );
      
      const materialesDetalle = await Promise.all(
        prestamosActivos.map(async (prestamo: Prestamo) => {
          try {
            const materialResponse = await api.get(`/materiales/${prestamo.material_id}`);
            const fechaDevolucion = new Date(prestamo.fecha_devolucion_esperada);
            const fechaActual = new Date();
            const isOverdue = fechaActual > fechaDevolucion && !prestamo.fecha_devolucion_real;
            
            return {
              material_titulo: materialResponse.data?.titulo || `Material #${prestamo.material_id}`,
              fecha_devolucion_esperada: prestamo.fecha_devolucion_esperada,
              overdue: isOverdue
            };
          } catch {
            const fechaDevolucion = new Date(prestamo.fecha_devolucion_esperada);
            const fechaActual = new Date();
            const isOverdue = fechaActual > fechaDevolucion && !prestamo.fecha_devolucion_real;
            
            return {
              material_titulo: `Material #${prestamo.material_id}`,
              fecha_devolucion_esperada: prestamo.fecha_devolucion_esperada,
              overdue: isOverdue
            };
          }
        })
      );

      setClienteDetalle({
        nombre: userDetails.nombre,
        carne: userDetails.carne,
        direccion: userDetails.direccion,
        prestamos_activos: prestamosActivos.length,
        materiales_prestados: materialesDetalle,
        historial_prestamos: prestamosData.length
      });
    } catch (err) {
      console.error('Error fetching client details:', err);
      setClienteDetalle({
        nombre: nombre || `Usuario #${userId}`,
        carne: carne || '',
        direccion: direccion || '',
        prestamos_activos: 0,
        materiales_prestados: [],
        historial_prestamos: 0
      });
    } finally {
      setLoadingCliente(false);
    }
  };

  const openClientModal = (solicitud: Solicitud) => {
    setShowClientModal(true);
    fetchClienteDetalle(
      solicitud.usuario_id, 
      solicitud.carne_identidad, 
      solicitud.nombre_usuario, 
      solicitud.direccion_usuario
    );
  };

  const closeClientModal = () => {
    setShowClientModal(false);
    setClienteDetalle(null);
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

  const openObservacionModal = (observacion: string) => {
    setSelectedObservacion(observacion);
    setShowObservacionModal(true);
  };

  const closeObservacionModal = () => {
    setShowObservacionModal(false);
    setSelectedObservacion('');
  };

  const handleProcessSolicitud = async () => {
    if (!selectedSolicitudId || !selectedAction) return;
    
    setProcessingId(selectedSolicitudId);
    try {
      // Find the current solicitud to get user and material info
      const currentSolicitud = solicitudes.find(s => s.id === selectedSolicitudId);
      if (!currentSolicitud) {
        throw new Error('Solicitud no encontrada');
      }

      // Update the request status
      await api.put(`/solicitudes/${selectedSolicitudId}`, {
        estado: selectedAction === 'aprobar' ? 'aprobada' : 'rechazada',
        observaciones: observaciones || undefined
      });

      // If approving, create a loan
      if (selectedAction === 'aprobar') {
        try {
          await api.post('/prestamos', {
            usuario_id: currentSolicitud.usuario_id,
            material_id: currentSolicitud.material_id
          });
          console.log('Préstamo creado exitosamente');
        } catch (loanError) {
          console.error('Error creating loan:', loanError);
          // Even if loan creation fails, we continue since the request was approved
          // You might want to show a warning to the user
          setError('Solicitud aprobada pero hubo un error al crear el préstamo. Verifique manualmente.');
        }
      }
      
      // Refresh the list
      fetchSolicitudes();
      closeObservacionesModal();
    } catch (err) {
      console.error(`Error ${selectedAction === 'aprobar' ? 'aprobando' : 'rechazando'} solicitud:`, err);
      setError(`Error al ${selectedAction === 'aprobar' ? 'aprobar' : 'rechazar'} la solicitud.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefresh = async () => {
    setFilterEstado('');
    setError('');
    setCurrentPage(1);
    setLoading(true);
    try {
      const response = await api.get(`/solicitudes?page=1&size=${pageSize}`);
      
      // Handle the paginated response structure
      const responseData = response.data;
      let solicitudesData = [];
      let paginationData = null;
      
      // Check if response has pagination structure
      if (responseData && typeof responseData === 'object') {
        if (Array.isArray(responseData.data) && responseData.pagination) {
          solicitudesData = responseData.data;
          paginationData = responseData.pagination;
        } else if (Array.isArray(responseData.solicitudes) && responseData.pagination) {
          solicitudesData = responseData.solicitudes;
          paginationData = responseData.pagination;
        } else if (Array.isArray(responseData)) {
          // Fallback for non-paginated response
          solicitudesData = responseData;
        } else {
          console.error('Unexpected response structure:', responseData);
          setError('Error: Estructura de respuesta inesperada del servidor.');
          setSolicitudes([]);
          return;
        }
      }
      
      // Update pagination state
      if (paginationData) {
        setPagination(paginationData);
        setCurrentPage(paginationData.page);
      } else {
        // Fallback pagination for non-paginated responses
        setPagination({
          total: solicitudesData.length,
          page: 1,
          size: solicitudesData.length,
          pages: 1
        });
        setCurrentPage(1);
      }

      // Ensure we have an array
      if (!Array.isArray(solicitudesData)) {
        console.error('Response is not an array:', solicitudesData);
        setError('Error: Los datos recibidos no tienen el formato esperado.');
        setSolicitudes([]);
        return;
      }

      // Extract unique user IDs
      const userIds = [...new Set(solicitudesData.map((s: Solicitud) => s.usuario_id))];
      
      // Fetch user details for all unique user IDs
      const usersPromises = userIds.map((userId: number) => 
        api.get(`/usuarios/${userId}`).catch(() => ({ data: null }))
      );
      
      const usersResponses = await Promise.all(usersPromises);
      interface UserData {
        nombre: string;
        carne_identidad: string;
        direccion: string;
      }
      const usersData: Record<number, UserData> = {};
      
      usersResponses.forEach((response, index) => {
        if (response.data) {
          usersData[userIds[index]] = response.data;
        }
      });
      
      setClientesData(usersData);
      
      // Fetch material details
      const materialesIds = solicitudesData.map((s: Solicitud) => s.material_id);
      
      if (materialesIds.length > 0) {
        try {
          const materialesPromises = materialesIds.map((id: number) => 
            api.get(`/materiales/${id}`).catch(() => ({ data: null }))
          );
          
          const materialesResponses = await Promise.all(materialesPromises);
          
          const solicitudesConTitulos = solicitudesData.map((solicitud: Solicitud, index: number) => {
            const materialData = materialesResponses[index].data;
            const userData = usersData[solicitud.usuario_id];
            return {
              ...solicitud,
              titulo_material: materialData ? materialData.titulo : `Material #${solicitud.material_id}`,
              nombre_usuario: userData?.nombre || `Usuario #${solicitud.usuario_id}`,
              carne_identidad: userData?.carne_identidad || '',
              direccion_usuario: userData?.direccion || ''
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
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages && newPage !== currentPage && !loadingPage) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (newSize !== pageSize && !loadingPage) {
      setPageSize(newSize);
      setCurrentPage(1);
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
            <div className="col-md-3">
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
            <div className="col-md-2">
              <select 
                className="form-select form-select-sm"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                <option value={5}>5 por página</option>
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
              </select>
            </div>
            <div className="col-auto">
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi bi-arrow-clockwise me-1"></i>
                )}
                Refrescar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {solicitudes.length === 0 && !loading && !loadingPage ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay solicitudes{filterEstado ? ` en estado "${filterEstado}"` : ''}.
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted">
              {loadingPage ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Cargando página...
                </>
              ) : (
                <>
                  Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, pagination.total)} de {pagination.total} solicitudes
                </>
              )}
            </span>
          </div>
          
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-light">
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Material</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingPage ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="mt-2 mb-0 text-muted">Cargando solicitudes...</p>
                    </td>
                  </tr>
                ) : (
                  solicitudes.map((solicitud) => (
                    <tr key={solicitud.id}>
                      <td>{solicitud.id}</td>
                      <td>
                        <button 
                          className="btn btn-link p-0 text-start text-decoration-none"
                          onClick={() => openClientModal(solicitud)}
                          title="Ver detalles del cliente"
                        >
                          <i className="bi bi-person-circle me-1"></i>
                          {solicitud.carne_identidad || `Usuario #${solicitud.usuario_id}`}
                        </button>
                      </td>
                      <td>{solicitud.titulo_material || `Material #${solicitud.material_id}`}</td>
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
                      <td>{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</td>
                      <td>
                        {solicitud.observaciones ? (
                          <button 
                            className="btn btn-link p-0 text-start text-decoration-none"
                            onClick={() => openObservacionModal(solicitud.observaciones!)}
                            title="Ver observaciones completas"
                          >
                            <i className="bi bi-chat-text me-1"></i>
                            {solicitud.observaciones.length > 30 
                              ? `${solicitud.observaciones.substring(0, 30)}...` 
                              : solicitud.observaciones
                            }
                          </button>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
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
                                <i className=""></i>
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
                                <i className=""></i>
                              )}
                              {' '}Rechazar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav aria-label="Paginación de solicitudes">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 || loadingPage ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loadingPage}
                    >
                      <i className="bi bi-chevron-left"></i>
                      Anterior
                    </button>
                  </li>
                  
                  {[...Array(pagination.pages)].map((_, index) => {
                    const page = index + 1;
                    // Show first page, last page, current page, and pages around current page
                    if (
                      page === 1 || 
                      page === pagination.pages || 
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''} ${loadingPage ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(page)}
                            disabled={loadingPage}
                          >
                            {loadingPage && currentPage === page ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              page
                            )}
                          </button>
                        </li>
                      );
                    } else if (
                      page === currentPage - 3 || 
                      page === currentPage + 3
                    ) {
                      return (
                        <li key={page} className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                    }
                    return null;
                  })}
                  
                  <li className={`page-item ${currentPage === pagination.pages || loadingPage ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.pages || loadingPage}
                    >
                      Siguiente
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
      
      {/* Modal para ver observaciones */}
      {showObservacionModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-chat-text me-2"></i>
                  Observaciones
                </h5>
                <button type="button" className="btn-close" onClick={closeObservacionModal}></button>
              </div>
              <div className="modal-body">
                <div className="card bg-light">
                  <div className="card-body">
                    <p className="mb-0">{selectedObservacion}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeObservacionModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para detalles del cliente */}
      {showClientModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-badge me-2"></i>
                  Detalles del Cliente
                </h5>
                <button type="button" className="btn-close" onClick={closeClientModal}></button>
              </div>
              <div className="modal-body">
                {loadingCliente ? (
                  <div className="text-center p-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando información del cliente...</p>
                  </div>
                ) : clienteDetalle && (
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-primary">Información Personal</h6>
                      <div className="card bg-light">
                        <div className="card-body">
                          <p><strong>Nombre:</strong> {clienteDetalle.nombre}</p>
                          <p><strong>Carné:</strong> {clienteDetalle.carne}</p>
                          <p><strong>Dirección:</strong> {clienteDetalle.direccion}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary">Estadísticas de Préstamos</h6>
                      <div className="card bg-light">
                        <div className="card-body">
                          <p><strong>Préstamos Activos:</strong> 
                            <span className={`badge ms-2 ${clienteDetalle.prestamos_activos > 0 ? 'bg-warning' : 'bg-success'}`}>
                              {clienteDetalle.prestamos_activos}
                            </span>
                          </p>
                          <p><strong>Total Histórico:</strong> 
                            <span className="badge bg-info ms-2">{clienteDetalle.historial_prestamos}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 mt-3">
                      <h6 className="text-primary">Materiales Actualmente Prestados</h6>
                      {clienteDetalle.materiales_prestados.length > 0 ? (
                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <table className="table table-sm table-striped">
                            <thead className="table-light sticky-top">
                              <tr>
                                <th>Material</th>
                                <th>Fecha de Devolución</th>
                                <th>Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {clienteDetalle.materiales_prestados.map((prestamo, index) => (
                                <tr key={index}>
                                  <td>
                                    <i className="bi bi-book me-2"></i>
                                    {prestamo.material_titulo}
                                  </td>
                                  <td>
                                    {new Date(prestamo.fecha_devolucion_esperada).toLocaleDateString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>
                                  <td>
                                    {prestamo.overdue ? (
                                      <span className="badge bg-danger">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        Vencido
                                      </span>
                                    ) : (
                                      <span className="badge bg-success">
                                        <i className="bi bi-check-circle me-1"></i>
                                        A Tiempo
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          No tiene materiales prestados actualmente
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeClientModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
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
                    placeholder={`Añada comentarios sobre la ${selectedAction === 'aprobar' ? 'aprobatión' : 'razón del rechazo'}...`}
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