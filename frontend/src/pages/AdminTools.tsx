import { useState, useEffect } from 'react';
import api from '../services/axiosInstance';
import { generateUsername, generatePassword } from '../utils/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface User {
  id: number;
  nombre: string;
  carne_identidad: string;
  [key: string]: string | number;
}

const AdminTools = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [credentials, setCredentials] = useState<{username: string, password: string} | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/usuarios?skip=0&limit=100');
      setUsers(response.data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const generateCredentials = () => {
    if (!selectedUserId) return;
    
    const username = generateUsername(selectedUserId);
    const password = generatePassword(selectedUserId);
    
    setCredentials({ username, password });
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Herramienta de Administrador - Generador de Credenciales</h2>
      
      {error && (
        <div className="alert alert-danger mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}
      
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h4><i className="bi bi-people-fill me-2"></i>Usuarios</h4>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando usuarios...</p>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label htmlFor="userSelect" className="form-label">Seleccionar Usuario:</label>
                <select 
                  className="form-select" 
                  id="userSelect"
                  onChange={(e) => setSelectedUserId(parseInt(e.target.value) || null)}
                  value={selectedUserId || ''}
                >
                  <option value="">-- Seleccione un usuario --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      ID: {user.id} - {user.nombre} ({user.carne_identidad})
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={generateCredentials}
                disabled={!selectedUserId}
              >
                <i className="bi bi-key-fill me-2"></i>
                Generar Credenciales
              </button>
            </>
          )}
        </div>
      </div>
      
      {credentials && (
        <div className="card">
          <div className="card-header bg-success text-white">
            <h4><i className="bi bi-check-circle-fill me-2"></i>Credenciales Generadas</h4>
          </div>
          <div className="card-body">
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              Estas credenciales son específicas para el usuario seleccionado. Guárdelas en un lugar seguro.
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-bold">Nombre de Usuario:</label>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  value={credentials.username} 
                  readOnly 
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => navigator.clipboard.writeText(credentials.username)}
                >
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-bold">Contraseña:</label>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  value={credentials.password} 
                  readOnly 
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => navigator.clipboard.writeText(credentials.password)}
                >
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
            </div>
            
            <div className="d-grid">
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  const text = `Nombre de Usuario: ${credentials.username}\nContraseña: ${credentials.password}`;
                  navigator.clipboard.writeText(text);
                }}
              >
                <i className="bi bi-clipboard-check me-2"></i>
                Copiar ambas credenciales
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTools;