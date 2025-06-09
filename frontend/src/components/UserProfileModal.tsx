import React, { useState, useEffect } from 'react';
import api from '../services/axiosInstance';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface UserProfileData {
  id: number;
  nombre: string;
  email: string;
  carne_identidad: string;
  direccion: string;
  rol: string;
  activo: boolean;
}

interface UserProfileModalProps {
  show: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ show, onClose }) => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      fetchUserProfile();
    }
  }, [show]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
      try {
      const response = await api.get('/auth/me');
      setUserData(response.data);
    } catch (err: unknown) {
      console.error('Error fetching user profile:', err);
      setError('Error al cargar el perfil del usuario. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUserData(null);
    setError(null);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-md">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header text-white position-relative" style={{ 
            background: 'linear-gradient(135deg, #853303 0%, #945c08 100%)',
            borderRadius: '0.5rem 0.5rem 0 0'
          }}>
            <h5 className="modal-title fw-bold">
              <i className="bi bi-person-circle me-2"></i>Mi Perfil
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body p-2" style={{ backgroundColor: '#f8f9fa' }}>
            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary mb-2" role="status" style={{ width: '2rem', height: '2rem' }}>
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="text-muted fs-6">Cargando información del perfil...</p>
              </div>
            )}

            {error && (
              <div className="alert alert-danger d-flex align-items-center border-0 shadow-sm" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>{error}</div>
              </div>
            )}

            {userData && !loading && (
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                  <div className="card-body p-3">
                    <div className="d-flex flex-column gap-2">
                      {/* Profile Picture Section */}
                      <div className="text-center mb-2">
                        <div className="position-relative d-inline-block">
                          <div className="text-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-lg" 
                               style={{ 
                                 width: '60px', 
                                 height: '60px', 
                                 fontSize: '1.5rem',
                                 background: 'linear-gradient(135deg, #853303 0%, #945c08 100%)'
                               }}>
                            <i className="bi bi-person-fill"></i>
                          </div>
                          <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white border-2" 
                               style={{ width: '16px', height: '16px' }}></div>
                        </div>
                        <h6 className="mt-2 mb-1 text-dark fw-bold">{userData.nombre}</h6>
                        <p className="text-muted mb-0 small">{userData.email}</p>
                      </div>

                      {/* Personal Information */}
                      <div className="p-2 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e9ecef' }}>
                        <label className="form-label text-muted small fw-semibold mb-1">
                          <i className="bi bi-envelope me-1 text-primary"></i>Correo
                        </label>
                        <div className="fw-medium text-dark small">
                          {userData.email}
                        </div>
                      </div>

                      <div className="p-2 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e9ecef' }}>
                        <label className="form-label text-muted small fw-semibold mb-1">
                          <i className="bi bi-card-text me-1 text-primary"></i>Carné
                        </label>
                        <div className="fw-medium text-dark small">
                          {userData.carne_identidad}
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <div className="flex-fill p-2 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e9ecef' }}>
                          <label className="form-label text-muted small fw-semibold mb-1">
                            <i className="bi bi-shield-check me-1 text-primary"></i>Rol
                          </label>
                          <div>
                            <span className={`badge px-2 py-1 rounded-pill ${userData.rol === 'admin' ? 'bg-secondary' : 'bg-secondary'}`}>
                              <i className={`bi ${userData.rol === 'admin' ? 'bi-shield-fill-exclamation' : 'bi-person-check'} me-1`}></i>
                              <span className="small">{userData.rol === 'admin' ? 'Admin' : 'Usuario'}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex-fill p-2 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e9ecef' }}>
                          <label className="form-label text-muted small fw-semibold mb-1">
                            <i className="bi bi-toggle-on me-1 text-primary"></i>Estado
                          </label>
                          <div>
                            <span className={`badge px-2 py-1 rounded-pill ${userData.activo ? 'bg-success' : 'bg-secondary'}`}>
                              <i className={`bi ${userData.activo ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                              <span className="small">{userData.activo ? 'Activa' : 'Inactiva'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e9ecef' }}>
                        <label className="form-label text-muted small fw-semibold mb-1">
                          <i className="bi bi-geo-alt me-1 text-primary"></i>Dirección
                        </label>
                        <div className="fw-medium text-dark small">
                          {userData.direccion}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
