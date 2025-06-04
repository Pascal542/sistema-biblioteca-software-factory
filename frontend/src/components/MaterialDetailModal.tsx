import React, { useState, useEffect } from 'react';
import api from '../services/axiosInstance';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface Material {
  id: number;
  titulo: string;
  autor: string;
  tipo: string;
  descripcion?: string;
  ubicacion?: string;
  estado?: string;
  cantidad?: number;
  total?: number;
  fecha_adquisicion?: string;
  activo?: boolean;
  // Additional fields from MaterialDetalle interface
  identificador?: string;
  anio_publicacion?: number;
  anio_llegada?: number;
  editorial?: string;
  cantidad_total?: number;
  cantidad_prestamo?: number;
  factor_estancia?: number;
}

interface MaterialDetailModalProps {
  show: boolean;
  materialId: number | null;
  onClose: () => void;
  onMaterialUpdate?: (material: Material) => void;
}

const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  show,
  materialId,
  onClose,
  onMaterialUpdate
}) => {
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && materialId) {
      fetchMaterialDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, materialId]);

  const fetchMaterialDetails = async () => {
    if (!materialId) return;
    
    setLoading(true);
    setError('');
    setMaterial(null);
    
    try {
      const response = await api.get(`/materiales/${materialId}`);
      
      if (response.data) {
        setMaterial(response.data);
        
        // Callback to update parent component if needed
        if (onMaterialUpdate) {
          onMaterialUpdate(response.data);
        }
      }
    } catch (err) {
      console.error('Error fetching material details:', err);
      setError('No se pudo obtener la información detallada del material.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado: string | undefined, activo: boolean | undefined) => {
    if (activo === false) {
      return <span className="badge bg-secondary">Inactivo</span>;
    }
    if (!estado) {
      return <span className="badge bg-secondary">Sin estado</span>;
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

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const calculateAvailable = (): number => {
    // Try both possible field combinations
    if (material?.cantidad !== undefined) {
      return material.cantidad;
    }
    if (material?.cantidad_total !== undefined && material?.cantidad_prestamo !== undefined) {
      return material.cantidad_total - material.cantidad_prestamo;
    }
    return 0;
  };

  const getTotal = (): number => {
    return material?.total || material?.cantidad_total || 0;
  };

  const getPrestamo = (): number => {
    return material?.cantidad_prestamo || 0;
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content p-2">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-book me-2"></i>
              Detalles del Material
            </h5>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-sm rounded-circle" 
              onClick={onClose}
              title="Cerrar"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-2">
                <div className="spinner-border text-primary mb-0" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="text-muted">Cargando información del material...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : material ? (
              <div className="row g-3">
                {/* Header with title and author */}
                <div className="col-12">
                  <div className="bg-light rounded p-1">
                    <h6 className="fw-bold">{material.titulo}</h6>
                    <p className="text-muted mb-1">
                      <i className="bi bi-person me-1"></i>
                      <strong>Autor:</strong> {material.autor}
                    </p>
                    <p className="text-muted mb-0">
                      <i className="bi bi-calendar me-1"></i>
                      <strong>Fecha de Adquisición:</strong> {formatDate(material.fecha_adquisicion)}
                    </p>
                  </div>
                </div>

                {/* Status and Type */}
                <div className="col-md-4">
                  <strong>Estado:</strong>
                  <div className="mb-2">{getStatusBadge(material.estado, material.activo)}</div>
                </div>

                <div className="col-md-4">
                  <strong>Tipo:</strong>
                  <div>{getTypeBadge(material.tipo)}</div>
                </div>

                {/* Basic Information */}
                <div className="col-md-4">
                  {material.identificador && (
                    <>
                      <strong>Identificador:</strong>
                      <div className="mb-2">{material.identificador}</div>
                    </>
                  )}
                  
                  {material.ubicacion && (
                    <>
                      <strong>Ubicación:</strong>
                      <div className="mb-2">
                        <i className="bi bi-geo-alt me-1"></i>
                        {material.ubicacion}
                      </div>
                    </>
                  )}
                </div>

                {/* Publication Information */}
                {(material.editorial || material.anio_publicacion || material.anio_llegada) && (
                  <>
                    <div className="col-md-6">
                      {material.editorial && (
                        <>
                          <strong>Editorial:</strong>
                          <div className="mb-2">{material.editorial}</div>
                        </>
                      )}
                      
                      {material.anio_publicacion && (
                        <>
                          <strong>Año de Publicación:</strong>
                          <div className="mb-2">{material.anio_publicacion}</div>
                        </>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      {material.anio_llegada && (
                        <>
                          <strong>Año de Llegada:</strong>
                          <div className="mb-2">{material.anio_llegada}</div>
                        </>
                      )}
                      
                      {material.factor_estancia && (
                        <>
                          <strong>Factor de Estancia:</strong>
                          <div className="mb-2">{material.factor_estancia}</div>
                        </>
                      )}
                    </div>
                  </>
                )}

                {/* Availability Information */}
                <div className="col-12">
                  <div className="bg-light rounded p-1">
                    <h6 className="mb-2">
                      <i className="bi bi-bar-chart me-1"></i>
                      Disponibilidad
                    </h6>
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="fw-bold text-primary">{getTotal()}</div>
                        <small className="text-muted">Total</small>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold text-warning">{getPrestamo()}</div>
                        <small className="text-muted">En préstamo</small>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold text-success">{calculateAvailable()}</div>
                        <small className="text-muted">Disponibles</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {material.descripcion && (
                  <div className="col-12">
                    <strong>Descripción:</strong>
                    <div className="border rounded p-2 mt-2 bg-light">
                      {material.descripcion}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                No se pudo cargar la información del material.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailModal;
