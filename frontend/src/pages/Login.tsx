import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Validación básica del formulario
      if (!email.trim()) {
        throw new Error('El email es obligatorio');
      }
      
      if (!password.trim()) {
        throw new Error('La contraseña es obligatoria');
      }
      
      const userData = await login(email, password);
      
      // Redireccionsegun rol
      if (userData.rol === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
      
    } catch (err: Error | unknown) {
      console.error("Error de autenticación:", err);
      if (err instanceof Error) {
        setError(err.message || 'Error al iniciar sesión');
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorObj = err as { response?: { data?: { detail?: string } } };
        setError(errorObj.response?.data?.detail || 'Error al iniciar sesión');
      } else {
        setError('Error al iniciar sesión');
      }
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
              <h2 className="text-center mb-4">Iniciar Sesión</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input 
                    id="email"
                    type="email" 
                    className="form-control"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input 
                    id="password"
                    type="password" 
                    className="form-control"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Iniciando sesión...
                    </>
                  ) : 'Iniciar Sesión'}
                </button>
              </form>
              
              <div className="text-center mt-3">
                <p>¿No tienes cuenta? <a href="/register" className="text-decoration-none">Regístrate</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;