import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="alert alert-danger text-center" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Acceso no autorizado. No tienes permisos para acceder a esta página.
      </div>
      <button 
        className="btn btn-primary mt-3"
        onClick={() => navigate('/login')}
      >
        <i className="bi bi-box-arrow-left me-2"></i>
        Volver al inicio de sesión
      </button>
    </div>
  );
};

export default Unauthorized;