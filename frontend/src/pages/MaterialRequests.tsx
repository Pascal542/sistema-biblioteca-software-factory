import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosInstance';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

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

interface PaginationInfo {
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface RequestStats {
  total_solicitudes: number;
  solicitudes_pendientes: number;
  solicitudes_aprobadas: number;
  solicitudes_rechazadas: number;
  solicitudes_canceladas: number;
}

interface ClienteData {
  nombre: string;
  carne_identidad: string;
  direccion: string;
}

interface MaterialData {
  titulo: string;
}

interface SolicitudResponse {
  data?: Solicitud[];
  solicitudes?: Solicitud[];
  pagination?: PaginationInfo;
}

interface Prestamo {
  estado: string;
  material_id: number;
  fecha_devolucion_esperada: string;
  fecha_devolucion_real: string | null;
}

interface PrestamosResponse {
  data?: Prestamo[];
  prestamos?: Prestamo[];
}

const MaterialRequests = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    size: 6,
    pages: 1
  });
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState<string>('');
  const [showObservacionesModal, setShowObservacionesModal] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<'aprobar' | 'rechazar' | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clienteDetalle, setClienteDetalle] = useState<ClienteDetalle | null>(null);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [showObservacionModal, setShowObservacionModal] = useState(false);
  const [selectedObservacion, setSelectedObservacion] = useState<string>('');
  const [clientesData, setClientesData] = useState<Record<number, ClienteData>>({});
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [activeStatus, setActiveStatus] = useState<'all' | 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'>('all');

  const fetchSolicitudes = async (page = pagination.page) => {
    setLoading(true);
    setError('');
    try {
      const endpoint = '/solicitudes';
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: '6'
      });

      if (activeStatus !== 'all') {
        params.append('estado', activeStatus);
      }

      const response = await api.get<SolicitudResponse | Solicitud[]>(`${endpoint}?${params}`);
      
      const responseData = response.data;
      let solicitudesData: Solicitud[] = [];
      let paginationData: PaginationInfo | null = null;
      
      if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
        const typedResponse = responseData as SolicitudResponse;
        if (Array.isArray(typedResponse.data) && typedResponse.pagination) {
          solicitudesData = typedResponse.data;
          paginationData = typedResponse.pagination;
        } else if (Array.isArray(typedResponse.solicitudes) && typedResponse.pagination) {
          solicitudesData = typedResponse.solicitudes;
          paginationData = typedResponse.pagination;
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
      } else if (Array.isArray(responseData)) {
        solicitudesData = responseData;
        if (activeStatus !== 'all') {
          solicitudesData = solicitudesData.filter(s => s.estado === activeStatus);
        }
      } else {
        throw new Error('Formato de respuesta inesperado');
      }

      if (paginationData) {
        setPagination({
          ...paginationData,
          size: 6
        });
      } else {
        setPagination({
          total: solicitudesData.length,
          page: 1,
          size: 6,
          pages: Math.ceil(solicitudesData.length / 6)
        });
      }

      const userIds = [...new Set(solicitudesData.map((s: Solicitud) => s.usuario_id))];
      const materialesIds = [...new Set(solicitudesData.map((s: Solicitud) => s.material_id))];
      
      const [usersResponses, materialesResponses] = await Promise.all([
        Promise.all(userIds.map((userId: number) => 
          api.get<ClienteData>(`/usuarios/${userId}`).catch(() => ({ data: null }))
        )),
        Promise.all(materialesIds.map((id: number) => 
          api.get<MaterialData>(`/materiales/${id}`).catch(() => ({ data: null }))
        ))
      ]);
      
      const usersData: Record<number, ClienteData> = {};
      const materialesData: Record<number, MaterialData> = {};
      
      usersResponses.forEach((response, index) => {
        if (response.data) {
          usersData[userIds[index]] = response.data;
        }
      });
      
      materialesResponses.forEach((response, index) => {
        if (response.data) {
          console.log(clientesData)
          materialesData[materialesIds[index]] = response.data;
        }
      });
      
      setClientesData(usersData);
      
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
      setPagination(prev => ({ ...prev, total: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get<SolicitudResponse | Solicitud[]>('/solicitudes');
      const allSolicitudes: Solicitud[] = Array.isArray(response.data) ? response.data : 
                            (response.data as SolicitudResponse)?.data || (response.data as SolicitudResponse)?.solicitudes || [];
      
      const stats: RequestStats = {
        total_solicitudes: allSolicitudes.length,
        solicitudes_pendientes: allSolicitudes.filter((s: Solicitud) => s.estado === 'pendiente').length,
        solicitudes_aprobadas: allSolicitudes.filter((s: Solicitud) => s.estado === 'aprobada').length,
        solicitudes_rechazadas: allSolicitudes.filter((s: Solicitud) => s.estado === 'rechazada').length,
        solicitudes_canceladas: allSolicitudes.filter((s: Solicitud) => s.estado === 'cancelada').length,
      };
      
      setStats(stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchClienteDetalle = async (userId: number, carne?: string, nombre?: string, direccion?: string) => {
    setLoadingCliente(true);
    try {
      let userDetails: ClienteData = { nombre: nombre || '', carne_identidad: carne || '', direccion: direccion || '' };
      
      try {
        const userResponse = await api.get<ClienteData>(`/usuarios/${userId}`);
        if (userResponse.data) {
          userDetails = {
            nombre: userResponse.data.nombre || nombre || `Usuario #${userId}`,
            carne_identidad: userResponse.data.carne_identidad || carne || '',
            direccion: userResponse.data.direccion || direccion || ''
          };
        }
      } catch {
        console.log('Could not fetch user details, using provided data');
      }

      let prestamosData: Prestamo[] = [];
      if (userDetails.carne_identidad) {
        try {
          const prestamosResponse = await api.get<PrestamosResponse | Prestamo[]>(`/prestamos?usuario=${userDetails.carne_identidad}`);
          const responseData = prestamosResponse.data;
          
          if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
            const typedResponse = responseData as PrestamosResponse;
            if (Array.isArray(typedResponse.data)) {
              prestamosData = typedResponse.data;
            } else if (Array.isArray(typedResponse.prestamos)) {
              prestamosData = typedResponse.prestamos;
            } else {
              prestamosData = [];
            }
          } else if (Array.isArray(responseData)) {
            prestamosData = responseData;
          } else {
            prestamosData = [];
          }
        } catch (err) {
          console.error('Error fetching prestamos:', err);
          prestamosData = [];
        }
      }
      
      const prestamosActivos = prestamosData.filter((p: Prestamo) => 
        p.estado === 'activo' || p.estado === 'Activo'
      );
      
      const materialesDetalle = await Promise.all(
        prestamosActivos.map(async (prestamo: Prestamo) => {
          try {
            const materialResponse = await api.get<MaterialData>(`/materiales/${prestamo.material_id}`);
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
        carne: userDetails.carne_identidad,
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

  useEffect(() => {
    fetchSolicitudes();
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus]);

  const getStatusBadge = (estado: string) => {
    const statusMap = {
      'pendiente': { class: 'bg-warning', icon: 'bi-clock' },
      'aprobada': { class: 'bg-success', icon: 'bi-check-circle' },
      'rechazada': { class: 'bg-danger', icon: 'bi-x-circle' },
      'cancelada': { class: 'bg-secondary', icon: 'bi-ban' }
    };
    const statusInfo = statusMap[estado as keyof typeof statusMap] || { class: 'bg-info', icon: 'bi-info-circle' };
    
    return (
      <span className={`badge ${statusInfo.class}`}>
        <i className={`bi ${statusInfo.icon} me-1`}></i>
        {estado.toUpperCase()}
      </span>
    );
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
      const currentSolicitud = solicitudes.find(s => s.id === selectedSolicitudId);
      if (!currentSolicitud) {
        throw new Error('Solicitud no encontrada');
      }

      await api.put(`/solicitudes/${selectedSolicitudId}`, {
        estado: selectedAction === 'aprobar' ? 'aprobada' : 'rechazada',
        observaciones: observaciones || undefined
      });

      if (selectedAction === 'aprobar') {
        try {
          await api.post('/prestamos', {
            usuario_id: currentSolicitud.usuario_id,
            material_id: currentSolicitud.material_id
          });
          console.log('Préstamo creado exitosamente');
        } catch (loanError) {
          console.error('Error creating loan:', loanError);
          setError('Solicitud aprobada pero hubo un error al crear el préstamo. Verifique manualmente.');
        }
      }
      
      fetchSolicitudes();
      fetchStats();
      closeObservacionesModal();
    } catch (err) {
      console.error(`Error ${selectedAction === 'aprobar' ? 'aprobando' : 'rechazando'} solicitud:`, err);
      setError(`Error al ${selectedAction === 'aprobar' ? 'aprobar' : 'rechazar'} la solicitud.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchSolicitudes(newPage);
    }
  };

  const handleStatusChange = (status: 'all' | 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada') => {
    setActiveStatus(status);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const currentPage = pagination.page;
    const totalPages = pagination.pages;
    
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
        <button key={1} className="page-link" onClick={() => handlePageChange(1)}>1</button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="page-link">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          className={`page-link ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="page-link">...</span>);
      }
      buttons.push(
        <button key={totalPages} className="page-link" onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg,rgb(255, 255, 255) 100%,rgb(255, 255, 255) 100%)'}}>
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container py-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-outline-secondary btn-sm me-2" 
                onClick={() => navigate('/admin-dashboard')}
                title="Volver"
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <div>
                <h5 className="mb-0">Gestión de Solicitudes</h5>
                <small className="text-muted">Administra las solicitudes de materiales</small>
              </div>
            </div>
            
            {stats && (
              <div className="d-flex gap-3">
                <div className="text-center">
                  <div className="fw-bold text-primary small">{stats.total_solicitudes}</div>
                  <small className="text-muted" style={{fontSize: '0.75rem'}}>Total</small>
                </div>
                <div className="text-center">
                  <div className="fw-bold text-warning small">{stats.solicitudes_pendientes}</div>
                  <small className="text-muted" style={{fontSize: '0.75rem'}}>Pendientes</small>
                </div>
                <div className="text-center">
                  <div className="fw-bold text-success small">{stats.solicitudes_aprobadas}</div>
                  <small className="text-muted" style={{fontSize: '0.75rem'}}>Aprobadas</small>
                </div>
                <div className="text-center">
                  <div className="fw-bold text-danger small">{stats.solicitudes_rechazadas}</div>
                  <small className="text-muted" style={{fontSize: '0.75rem'}}>Rechazadas</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-bottom">
        <div className="container py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-8">
              <div className="btn-group btn-group-sm" role="group">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="statusFilter" 
                  id="all" 
                  checked={activeStatus === 'all'}
                  onChange={() => handleStatusChange('all')}
                />
                <label className="btn btn-outline-primary" htmlFor="all">
                  <i className="bi bi-collection me-1"></i>Todas
                </label>

                <input 
                  type="radio" 
                  className="btn-check" 
                  name="statusFilter" 
                  id="pendiente" 
                  checked={activeStatus === 'pendiente'}
                  onChange={() => handleStatusChange('pendiente')}
                />
                <label className="btn btn-outline-primary" htmlFor="pendiente">
                  <i className="bi bi-clock me-1"></i>Pendientes
                </label>

                <input 
                  type="radio" 
                  className="btn-check" 
                  name="statusFilter" 
                  id="aprobada" 
                  checked={activeStatus === 'aprobada'}
                  onChange={() => handleStatusChange('aprobada')}
                />
                <label className="btn btn-outline-primary" htmlFor="aprobada">
                  <i className="bi bi-check-circle me-1"></i>Aprobadas
                </label>

                <input 
                  type="radio" 
                  className="btn-check" 
                  name="statusFilter" 
                  id="rechazada" 
                  checked={activeStatus === 'rechazada'}
                  onChange={() => handleStatusChange('rechazada')}
                />
                <label className="btn btn-outline-primary" htmlFor="rechazada">
                  <i className="bi bi-x-circle me-1"></i>Rechazadas
                </label>

                <input 
                  type="radio" 
                  className="btn-check" 
                  name="statusFilter" 
                  id="cancelada" 
                  checked={activeStatus === 'cancelada'}
                  onChange={() => handleStatusChange('cancelada')}
                />
                <label className="btn btn-outline-primary" htmlFor="cancelada">
                  <i className="bi bi-ban me-1"></i>Canceladas
                </label>
              </div>
            </div>
            
            <div className="col-md-2 text-end">
              <small className="text-muted" style={{fontSize: '0.8rem'}}>
                {pagination.total} solicitud{pagination.total !== 1 ? 'es' : ''}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-3">
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando solicitudes...</p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox display-1 text-muted mb-3"></i>
            <h5>No se encontraron solicitudes</h5>
            <p className="text-muted">No hay solicitudes{activeStatus !== 'all' ? ` en estado "${activeStatus}"` : ''}</p>
          </div>
        ) : (
          <>
            {/* Request Cards for Mobile */}
            <div className="d-md-none">
              {solicitudes.map((solicitud) => (
                <div key={solicitud.id} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">#{solicitud.id}</h6>
                      {getStatusBadge(solicitud.estado)}
                    </div>
                    
                    <div className="mb-2">
                      <button 
                        className="btn btn-link p-0 text-start text-decoration-none fw-medium"
                        onClick={() => openClientModal(solicitud)}
                      >
                        <i className="bi bi-person-circle me-1"></i>
                        {solicitud.carne_identidad || solicitud.nombre_usuario}
                      </button>
                    </div>
                    
                    <p className="card-text text-muted small mb-2">
                      <i className="bi bi-book me-1"></i>
                      {solicitud.titulo_material}
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                      </small>
                      
                      <div className="d-flex gap-1">
                        {solicitud.observaciones && (
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => openObservacionModal(solicitud.observaciones!)}
                            title="Ver observaciones"
                          >
                            <i className="bi bi-chat-text"></i>
                          </button>
                        )}
                        
                        {solicitud.estado === 'pendiente' && (
                          <>
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => openObservacionesModal(solicitud.id, 'aprobar')}
                              disabled={processingId === solicitud.id}
                            >
                              <i className="bi bi-check"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => openObservacionesModal(solicitud.id, 'rechazar')}
                              disabled={processingId === solicitud.id}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Request Table for Desktop */}
            <div className="d-none d-md-block">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{width: '8%'}}>Nro</th>
                      <th style={{width: '20%'}}>Cliente</th>
                      <th style={{width: '30%'}}>Material</th>
                      <th style={{width: '12%'}}>Estado</th>
                      <th style={{width: '12%'}}>Fecha</th>
                      <th style={{width: '13%'}}>Observaciones</th>
                      <th style={{width: '130px'}}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((solicitud) => (
                      <tr key={solicitud.id}>
                        <td>
                          <span className="fw-medium">#{solicitud.id}</span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-link p-0 text-start text-decoration-none"
                            onClick={() => openClientModal(solicitud)}
                            title="Ver detalles del cliente"
                          >
                            <div className="text-truncate" style={{maxWidth: '150px'}}>
                              {solicitud.carne_identidad || solicitud.nombre_usuario}
                            </div>
                          </button>
                        </td>
                        <td>
                          <div className="text-truncate" style={{maxWidth: '250px'}} title={solicitud.titulo_material}>
                            <i className="bi bi-book me-1 text-muted"></i>
                            {solicitud.titulo_material}
                          </div>
                        </td>
                        <td>{getStatusBadge(solicitud.estado)}</td>
                        <td>
                          <small className="text-muted">
                            {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                          </small>
                        </td>
                        <td>
                          {solicitud.observaciones ? (
                            <button 
                              className="btn btn-link p-0 text-start text-decoration-none"
                              onClick={() => openObservacionModal(solicitud.observaciones!)}
                              title="Ver observaciones completas"
                            >
                              <i className="bi bi-chat-text me-1"></i>
                              <span className="text-truncate d-inline-block" style={{maxWidth: '100px'}}>
                                {solicitud.observaciones.length > 20 
                                  ? `${solicitud.observaciones.substring(0, 20)}...` 
                                  : solicitud.observaciones
                                }
                              </span>
                            </button>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {solicitud.estado === 'pendiente' ? (
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-success"
                                onClick={() => openObservacionesModal(solicitud.id, 'aprobar')}
                                disabled={processingId === solicitud.id}
                                title="Aprobar solicitud"
                              >
                                {processingId === solicitud.id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <i className="bi bi-check"></i>
                                )}
                              </button>
                              <button 
                                className="btn btn-danger"
                                onClick={() => openObservacionesModal(solicitud.id, 'rechazar')}
                                disabled={processingId === solicitud.id}
                                title="Rechazar solicitud"
                              >
                                {processingId === solicitud.id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <i className="bi bi-x"></i>
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-2">
                <small className="text-muted">
                  Página {pagination.page} de {pagination.pages}
                </small>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    
                    {renderPaginationButtons().map((button, index) => (
                      <li key={index} className={`page-item ${button.props?.className?.includes('active') ? 'active' : ''}`}>
                        {button}
                      </li>
                    ))}
                    
                    <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

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