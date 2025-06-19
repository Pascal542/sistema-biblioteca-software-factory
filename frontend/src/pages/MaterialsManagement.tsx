import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosInstance';
import MaterialDetailModal from '../components/MaterialDetailModal';
import '../styles/MaterialsManagement.css';

interface Material {
  id: number;
  titulo: string;
  autor: string;
  tipo: string;
  descripcion: string;
  ubicacion: string;
  estado: string;
  cantidad: number;
  total: number;
  fecha_adquisicion: string;
  activo: boolean;
}

interface PaginationInfo {
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface FilterState {
  titulo: string;
  autor: string;
  tipo: string;
  estado: string;
}

interface MaterialStats {
  total_materiales: number;
  materiales_disponibles: number;
  materiales_prestados: number;
  por_tipo: Array<{ tipo: string; cantidad: number }>;
}

const MaterialsManagement = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    size: 6,
    pages: 1
  });
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    titulo: '',
    autor: '',
    tipo: '',
    estado: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<MaterialStats | null>(null);
  const [activeType, setActiveType] = useState<'all' | 'libro' | 'revista' | 'acta de congreso'>('all');
  const [currentMaterialId, setCurrentMaterialId] = useState<number | null>(null);

  const fetchMaterials = async (page = pagination.page) => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '/materiales';
      
      if (activeType !== 'all') {
        endpoint = `/materiales/por-tipo/${activeType}`;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        size: '6'
      });

      const response = await api.get(`${endpoint}?${params}`);
      
      if (response.data && response.data.data && response.data.pagination) {
        setMaterials(response.data.data);
        setPagination({
          ...response.data.pagination,
          size: 6
        });
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Error al cargar los materiales.');
      setMaterials([]);
      setPagination(prev => ({ ...prev, total: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  const searchMaterialsGeneral = async (page = pagination.page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '6',
        titulo: searchTerm.trim()
      });

      if (activeType !== 'all') {
        params.append('tipo', activeType);
      }

      const response = await api.get(`/materiales/buscar/avanzado?${params}`);
      
      if (response.data && response.data.data && response.data.pagination) {
        setMaterials(response.data.data);
        setPagination({
          ...response.data.pagination,
          size: 6
        });
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (err) {
      console.error('Error searching materials:', err);
      setError('Error al buscar los materiales.');
      setMaterials([]);
      setPagination(prev => ({ ...prev, total: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  const searchMaterials = async (page = pagination.page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '6'
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim() !== '') {
          params.append(key, value.trim());
        }
      });

      if (activeType !== 'all') {
        params.append('tipo', activeType);
      }

      const response = await api.get(`/materiales/buscar/avanzado?${params}`);
      
      if (response.data && response.data.data && response.data.pagination) {
        setMaterials(response.data.data);
        setPagination({
          ...response.data.pagination,
          size: 6
        });
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (err) {
      console.error('Error searching materials:', err);
      setError('Error al buscar los materiales.');
      setMaterials([]);
      setPagination(prev => ({ ...prev, total: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/materiales/estadisticas/resumen');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const performSearch = (page = 1) => {
    if (searchTerm.trim() !== '') {
      searchMaterialsGeneral(page);
    } else if (Object.values(filters).some(filter => filter !== '')) {
      searchMaterials(page);
    } else {
      fetchMaterials(page);
    }
  };

  useEffect(() => {
    performSearch();
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType]);

  useEffect(() => {
    performSearch(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchTerm]);


  const getStatusBadge = (estado: string, activo: boolean) => {
    if (!activo) {
      return <span className="badge bg-secondary">Inactivo</span>;
    }
    return estado === 'disponible' ? 
      <span className="badge bg-success">Disponible</span> : 
      <span className="badge bg-danger">No Disponible</span>;
  };

  const getTypeBadge = (tipo: string) => {
    const typeMap = {
      'libro': { class: 'bg-primary', icon: 'bi-book' },
      'revista': { class: 'bg-info', icon: 'bi-newspaper' },
      'acta de congreso': { class: 'bg-warning', icon: 'bi-file-text' }
    };
    const typeInfo = typeMap[tipo as keyof typeof typeMap] || { class: 'bg-secondary', icon: 'bi-file' };
    
    return (
      <span className={`badge ${typeInfo.class}`}>
        <i className={`bi ${typeInfo.icon} me-1`}></i>
        {tipo}
      </span>
    );
  };

  const handleViewDescription = (material: Material) => {
    setCurrentMaterialId(material.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentMaterialId(null);
  };

  const clearFilters = () => {
    setFilters({ titulo: '', autor: '', tipo: '', estado: '' });
    setSearchTerm('');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      performSearch(newPage);
    }
  };

  const handleTypeChange = (type: 'all' | 'libro' | 'revista' | 'acta de congreso') => {
    setActiveType(type);
    setPagination(prev => ({ ...prev, page: 1 }));
    clearFilters();
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setFilters({ titulo: '', autor: '', tipo: '', estado: '' });
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const currentPage = pagination.page;
    const totalPages = pagination.pages;
    
    buttons.push(
      <button 
        key="prev"
        className="pagination-btn" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
    );

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
        <button key={1} className="pagination-btn" onClick={() => handlePageChange(1)}>1</button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      buttons.push(
        <button key={totalPages} className="pagination-btn" onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button 
        key="next"
        className="pagination-btn" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    );

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
                onClick={() => navigate(-1)}
                title="Volver"
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <div>
                <h5 className="mb-0">Catálogo de Materiales</h5>
                <small className="text-muted">Colección digital</small>
              </div>
            </div>
            
            {stats && (
              <div className="d-flex gap-3">
                <div className="text-center">
                  <div className="fw-bold text-primary small">{stats.total_materiales}</div>
                  <small className="text-muted" style={{fontSize: '0.75rem'}}>Total</small>
                </div>
                <div className="text-center">
                  <div className="fw-bold text-success small">{stats.materiales_disponibles}</div>
                  <small className="text-muted" style={{fontSize: '0.75rem'}}>Disponibles</small>
                </div>
                <div className="text-center">
                  <div className="fw-bold text-warning small">{stats.materiales_prestados}</div>
                  <small className="text-muted" style={{fontSize: '0.75rem'}}>Prestados</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-bottom">
        <div className="container py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <div className="btn-group btn-group-sm" role="group">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="typeFilter" 
                  id="all" 
                  checked={activeType === 'all'}
                  onChange={() => handleTypeChange('all')}
                />
                <label className="btn btn-outline-primary" htmlFor="all">
                  <i className="bi bi-collection me-1"></i>Todos
                </label>

                <input 
                  type="radio" 
                  className="btn-check" 
                  name="typeFilter" 
                  id="libro" 
                  checked={activeType === 'libro'}
                  onChange={() => handleTypeChange('libro')}
                />
                <label className="btn btn-outline-primary" htmlFor="libro">
                  <i className="bi bi-book me-1"></i>Libros
                </label>

                <input 
                  type="radio" 
                  className="btn-check" 
                  name="typeFilter" 
                  id="revista" 
                  checked={activeType === 'revista'}
                  onChange={() => handleTypeChange('revista')}
                />
                <label className="btn btn-outline-primary" htmlFor="revista">
                  <i className="bi bi-newspaper me-1"></i>Revistas
                </label>

                <input 
                  type="radio" 
                  className="btn-check" 
                  name="typeFilter" 
                  id="acta" 
                  checked={activeType === 'acta de congreso'}
                  onChange={() => handleTypeChange('acta de congreso')}
                />
                <label className="btn btn-outline-primary" htmlFor="acta">
                  <i className="bi bi-file-text me-1"></i>Actas
                </label>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar materiales..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
            
            <div className="col-md-2 text-end">
              <small className="text-muted" style={{fontSize: '0.8rem'}}>
                {pagination.total} resultado{pagination.total !== 1 ? 's' : ''}
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
            <p className="text-muted">Cargando materiales...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-search display-1 text-muted mb-3"></i>
            <h5>No se encontraron materiales</h5>
            <p className="text-muted">Intenta ajustar los filtros o la búsqueda</p>
          </div>
        ) : (
          <>
            {/* Materials Cards for Mobile */}
            <div className="d-md-none">
              {materials.map((material) => (
                <div key={material.id} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">{material.titulo}</h6>
                      <span className="text-muted small">#{material.id}</span>
                    </div>
                    <p className="card-text text-muted small mb-2">{material.autor}</p>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {getTypeBadge(material.tipo)}
                      {getStatusBadge(material.estado, material.activo)}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="bi bi-geo-alt me-1"></i>{material.ubicacion}
                      </small>
                      <div className="d-flex gap-2">
                        <span className="badge bg-light text-dark">
                          {material.cantidad}/{material.total}
                        </span>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDescription(material)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Materials Table for Desktop */}
            <div className="d-none d-md-block">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{width: '35%'}}>Título</th>
                      <th style={{width: '20%'}}>Autor</th>
                      <th style={{width: '12%'}}>Tipo</th>
                      <th style={{width: '15%'}}>Ubicación</th>
                      <th style={{width: '10%'}}>Estado</th>
                      <th style={{width: '8%'}}>Disponibles</th>
                      <th style={{width: '80px'}}>Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material) => (
                      <tr key={material.id} className={!material.activo ? 'table-secondary' : ''}>
                        <td>
                          <div 
                            className="fw-medium text-truncate" 
                            style={{maxWidth: '300px', cursor: 'pointer'}}
                            title={material.titulo}
                          >
                            {material.titulo}
                          </div>
                        </td>
                        <td className="text-muted">
                          <div className="text-truncate" style={{maxWidth: '150px'}} title={material.autor}>
                            {material.autor}
                          </div>
                        </td>
                        <td>{getTypeBadge(material.tipo)}</td>
                        <td>
                          <small className="text-muted text-truncate d-block" style={{maxWidth: '120px'}} title={material.ubicacion}>
                            <i className="bi bi-geo-alt me-1"></i>{material.ubicacion}
                          </small>
                        </td>
                        <td>{getStatusBadge(material.estado, material.activo)}</td>
                        <td>
                          <span className={`badge ${material.cantidad > 0 ? 'bg-secondary' : 'bg-danger'}`}>
                            {material.cantidad}/{material.total}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDescription(material)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
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
                    
                    {renderPaginationButtons().slice(1, -1).map((button, index) => (
                      <li key={index} className={`page-item ${button.props?.className?.includes('active') ? 'active' : ''}`}>
                        {button.type === 'button' ? (
                          <button 
                            className="page-link" 
                            onClick={button.props.onClick}
                          >
                            {button.props.children}
                          </button>
                        ) : (
                          <span className="page-link">{button.props.children}</span>
                        )}
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

      {/* Modal */}
      <MaterialDetailModal
        show={showModal}
        materialId={currentMaterialId}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default MaterialsManagement;