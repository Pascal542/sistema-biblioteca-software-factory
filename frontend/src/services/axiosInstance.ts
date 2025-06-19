import axios from 'axios';
import { BACKEND } from '../utils/conexion';

const api = axios.create({
  baseURL: `${BACKEND}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo limpiar token, no redireccionar automáticamente
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Permitir que el AuthContext maneje la redirección
    }
    return Promise.reject(error);
  }
);

export default api;