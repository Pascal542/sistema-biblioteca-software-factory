import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosInstance';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    carne_identidad: '',
    direccion: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error específico al editar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validación de nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    // Validación de email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }
    
    // Validación de contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    // Validación de confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!formData.carne_identidad.trim()) {
      newErrors.carne_identidad = 'El carné de identidad es obligatorio';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        carne_identidad: formData.carne_identidad,
        direccion: formData.direccion
      };
      
      const response = await api.post('/auth/register', userData);
      
      console.log('Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      if (response.status === 201) {
        console.log('Registro exitoso');
        navigate('/login', { state: { message: 'Registro exitoso. Por favor inicia sesión.' } });
      }
    } catch (err: unknown) {
      const error = err as { 
        response?: { 
          data?: { detail?: string },
          status?: number,
          statusText?: string
        },
        message?: string
      };
      
      setGeneralError(
        error.response?.data?.detail || 
        'Error al crear la cuenta. Por favor intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Crear Cuenta</h2>
              
              {generalError && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {generalError}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre completo</label>
                  <input
                    type="text"
                    className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                  {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="carne_identidad" className="form-label">Carné de Identidad</label>
                  <input
                    type="text"
                    className={`form-control ${errors.carne_identidad ? 'is-invalid' : ''}`}
                    id="carne_identidad"
                    name="carne_identidad"
                    value={formData.carne_identidad}
                    onChange={handleChange}
                    required
                  />
                  {errors.carne_identidad && <div className="invalid-feedback">{errors.carne_identidad}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="direccion" className="form-label">Dirección</label>
                  <textarea
                    className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                    id="direccion"
                    name="direccion"
                    rows={3}
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                  />
                  {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Crear Cuenta
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <p>¿Ya tienes cuenta? <a href="/login" className="text-decoration-none">Inicia sesión</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;