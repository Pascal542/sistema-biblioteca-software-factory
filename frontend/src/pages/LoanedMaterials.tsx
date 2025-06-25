import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface MaterialEnPrestamo {
  tipo: string;
  titulo: string;
  autor: string;
  cantidad_prestada: number;
  fecha_prestamo: string;
  factor_estancia: number;
  prestamo_id?: number;
}

const LoanedMaterials = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<MaterialEnPrestamo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [selectedMaterialTitle, setSelectedMaterialTitle] = useState<string>('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/prestamos/materiales/en-prestamo');
      setMaterials(response.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Error al cargar los materiales en préstamo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLoan = async (prestamoId: number) => {
    const material = materials.find(m => m.prestamo_id === prestamoId);
    setSelectedLoanId(prestamoId);
    setSelectedMaterialTitle(material?.titulo || 'Material');
    setShowCancelModal(true);
  };

  const confirmCancelLoan = async () => {
    if (!selectedLoanId) return;
    
    setCancellingId(selectedLoanId);
    setShowCancelModal(false);
    
    try {
      await axios.put(`/api/prestamos/${selectedLoanId}/cancelar`);
      
      await fetchMaterials();
    } catch (err) {
      console.error('Error cancelling loan:', err);
      setError('Error al cancelar el préstamo.');
    } finally {
      setCancellingId(null);
      setSelectedLoanId(null);
      setSelectedMaterialTitle('');
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedLoanId(null);
    setSelectedMaterialTitle('');
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando materiales en préstamo...</p>
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
                onClick={() => navigate(-1)}
                title="Volver"
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <div>
                <h5 className="mb-0">Materiales en Préstamo</h5>
                <small className="text-muted">Lista de materiales actualmente prestados</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <small className="text-muted">
                {materials.length} material{materials.length !== 1 ? 'es' : ''} en préstamo
              </small>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => fetchMaterials()}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Actualizar
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
        
        {materials.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-book-half display-1 text-muted mb-3"></i>
            <h5>No hay materiales en préstamo</h5>
            <p className="text-muted mb-3">Actualmente no hay materiales prestados</p>
          </div>
        ) : (
          <>
            {/* Cards para móvil */}
            <div className="d-md-none">
              {materials.map((material, index) => (
                <div key={index} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">{material.titulo}</h6>
                      <span className="badge bg-primary">{material.tipo}</span>
                    </div>
                    
                    <p className="text-muted mb-2">
                      <i className="bi bi-person me-1"></i>
                      {material.autor}
                    </p>
                    
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <small className="text-muted d-block">Cantidad Prestada</small>
                        <span className="badge bg-warning text-dark">{material.cantidad_prestada}</span>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Factor Estancia</small>
                        <span className="badge bg-info">{material.factor_estancia.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(material.fecha_prestamo).toLocaleDateString()}
                      </small>
                      {material.prestamo_id && (
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancelLoan(material.prestamo_id!)}
                          disabled={cancellingId === material.prestamo_id}
                          title="Cancelar préstamo"
                        >
                          {cancellingId === material.prestamo_id ? (
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Cancelando...</span>
                            </div>
                          ) : (
                            <i className="bi bi-x-circle"></i>
                          )}
                        </button>
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
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{width: '15%'}}>Tipo</th>
                          <th style={{width: '25%'}}>Título</th>
                          <th style={{width: '20%'}}>Autor</th>
                          <th style={{width: '10%'}}>Cantidad</th>
                          <th style={{width: '15%'}}>Fecha Préstamo</th>
                          <th style={{width: '10%'}}>Factor Estancia</th>
                          <th style={{width: '5%'}}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map((material, index) => (
                          <tr key={index}>
                            <td>
                              <span className="badge bg-primary">{material.tipo}</span>
                            </td>
                            <td>
                              <div className="text-truncate" style={{maxWidth: '250px'}} title={material.titulo}>
                                <strong>{material.titulo}</strong>
                              </div>
                            </td>
                            <td>
                              <div className="text-truncate" style={{maxWidth: '200px'}} title={material.autor}>
                                {material.autor}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-warning text-dark">{material.cantidad_prestada}</span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date(material.fecha_prestamo).toLocaleDateString()}
                              </small>
                            </td>
                            <td>
                              <span className="badge bg-info">{material.factor_estancia.toFixed(2)}</span>
                            </td>
                            <td>
                              {material.prestamo_id && (
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleCancelLoan(material.prestamo_id!)}
                                  disabled={cancellingId === material.prestamo_id}
                                  title="Cancelar préstamo"
                                >
                                  {cancellingId === material.prestamo_id ? (
                                    <div className="spinner-border spinner-border-sm" role="status">
                                      <span className="visually-hidden">Cancelando...</span>
                                    </div>
                                  ) : (
                                    <i className=""></i>
                                  )}
                                  Devuelto
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
          </>
        )}
      </div>

      {/* Modal de confirmación de cancelación */}
      <div className={`modal fade ${showCancelModal ? 'show' : ''}`} 
           style={{display: showCancelModal ? 'block' : 'none'}} 
           tabIndex={-1} 
           role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">
                <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                Confirmar Devolución
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeCancelModal}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-3">
                ¿Está seguro que desea devolver el siguiente material?
              </p>
              <div className="bg-light p-3 rounded">
                <h6 className="mb-0">{selectedMaterialTitle}</h6>
                <small className="text-muted">El material será devuelto al inventario</small>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={closeCancelModal}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={confirmCancelLoan}
              >
                <i className="bi bi-check-circle me-1"></i>
                Confirmar Devolución
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      {showCancelModal && (
        <div className="modal-backdrop fade show" onClick={closeCancelModal}></div>
      )}
    </div>
  );
};

export default LoanedMaterials;