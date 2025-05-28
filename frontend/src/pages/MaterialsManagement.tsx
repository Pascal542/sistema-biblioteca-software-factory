import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosInstance';
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
    size: 10,
    pages: 1
  });
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
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
        size: '10'
      });

      const response = await api.get(`${endpoint}?${params}`);
      
      if (response.data && response.data.data && response.data.pagination) {
        setMaterials(response.data.data);
        setPagination({
          ...response.data.pagination,
          size: 10
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
        size: '10',
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
          size: 10
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
        size: '10'
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
          size: 10
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
  }, [activeType]);

  useEffect(() => {
    performSearch(1);
  }, [filters, searchTerm]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const getStatusBadge = (estado: string, activo: boolean) => {
    if (!activo) {
      return <span className="status-badge inactive">Inactivo</span>;
    }
    return estado === 'disponible' ? 
      <span className="status-badge available">Disponible</span> : 
      <span className="status-badge unavailable">No Disponible</span>;
  };

  const getTypeBadge = (tipo: string) => {
    const typeClass = tipo === 'libro' ? 'book' : tipo === 'revista' ? 'magazine' : 'proceeding';
    return <span className={`type-badge ${typeClass}`}>{tipo}</span>;
  };

  const handleViewDescription = (material: Material) => {
    setSelectedMaterial(material);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMaterial(null);
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
    <div className="materials-management">
      <div className="materials-header align-items-center">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)} title="Volver">
            <i className="fas fa-arrow-left"></i>
          </button>
          <h3>Gestión de Materiales</h3>
          {stats && (
            <div className="stats-summary">

              <div className="type-filter d-flex align-items-center">
                <button
                  className={`type-btn ${activeType === 'all' ? 'active' : ''}`}
                  onClick={() => handleTypeChange('all')}
                >
                  <i className="fas fa-list"></i>
                  Todos
                </button>
                <button
                  className={`type-btn ${activeType === 'libro' ? 'active' : ''}`}
                  onClick={() => handleTypeChange('libro')}
                >
                  <i className="fas fa-book"></i>
                  Libros
                </button>
                <button
                  className={`type-btn ${activeType === 'revista' ? 'active' : ''}`}
                  onClick={() => handleTypeChange('revista')}
                >
                  <i className="fas fa-newspaper"></i>
                  Revistas
                </button>
                <button
                  className={`type-btn ${activeType === 'acta de congreso' ? 'active' : ''}`}
                  onClick={() => handleTypeChange('acta de congreso')}
                >
                  <i className="fas fa-file-alt"></i>
                  Actas
                </button>
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Buscar materiales..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                      <i className="fas fa-times"></i>
                    </button>
                  )}

                </div>
                <span className="results-count">
                  {pagination.total} resultado{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
  
      <div className="results-info">
        
      </div>
  
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}
  
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Cargando materiales...</span>
        </div>
      ) : (
        <>
          {materials.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-search"></i>
              <h3>No se encontraron materiales</h3>
              <p>Intenta ajustar los filtros o la búsqueda</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="materials-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>Autor</th>
                      <th>Tipo</th>
                      <th>Ubicación</th>
                      <th>Estado</th>
                      <th>Disponibilidad</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material) => (
                      <tr 
                        key={material.id} 
                        className={!material.activo ? 'inactive-row' : ''}
                      >
                        <td className="id-cell">#{material.id}</td>
                        <td className="title-cell">
                          <div className="title-content">
                            <span className="title-text">{material.titulo}</span>
                          </div>
                        </td>
                        <td className="author-cell">{material.autor}</td>
                        <td className="type-cell">
                          {getTypeBadge(material.tipo)}
                        </td>
                        <td className="location-cell">{material.ubicacion}</td>
                        <td className="status-cell">
                          {getStatusBadge(material.estado, material.activo)}
                        </td>
                        <td className="availability-cell">
                          <span className={`availability-count ${material.cantidad > 0 ? 'available' : 'unavailable'}`}>
                            {material.cantidad}/{material.total}
                          </span>
                        </td>
                        <td className="date-cell">
                          {formatDate(material.fecha_adquisicion)}
                        </td>
                        <td className="actions-cell">
                          <button 
                            className="details-btn"
                            onClick={() => handleViewDescription(material)}
                            title="Ver detalles"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
  
              {pagination.pages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Página {pagination.page} de {pagination.pages}
                  </div>
                  <div className="pagination">
                    {renderPaginationButtons()}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
  
      {showModal && selectedMaterial && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-info-circle"></i>
                Detalles del Material
              </h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>ID:</strong>
                  <span>{selectedMaterial.id}</span>
                </div>
                <div className="detail-item">
                  <strong>Estado:</strong>
                  {getStatusBadge(selectedMaterial.estado, selectedMaterial.activo)}
                </div>
                <div className="detail-item full-width">
                  <strong>Título:</strong>
                  <span>{selectedMaterial.titulo}</span>
                </div>
                <div className="detail-item">
                  <strong>Autor:</strong>
                  <span>{selectedMaterial.autor}</span>
                </div>
                <div className="detail-item">
                  <strong>Tipo:</strong>
                  {getTypeBadge(selectedMaterial.tipo)}
                </div>
                <div className="detail-item">
                  <strong>Ubicación:</strong>
                  <span>{selectedMaterial.ubicacion}</span>
                </div>
                <div className="detail-item">
                  <strong>Disponibles:</strong>
                  <span className={selectedMaterial.cantidad > 0 ? 'text-success' : 'text-danger'}>
                    {selectedMaterial.cantidad}/{selectedMaterial.total}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <strong>Fecha de Adquisición:</strong>
                  <span>{formatDate(selectedMaterial.fecha_adquisicion)}</span>
                </div>
                <div className="detail-item full-width">
                  <strong>Descripción:</strong>
                  <div className="description">
                    {selectedMaterial.descripcion || 'Sin descripción disponible'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default MaterialsManagement;