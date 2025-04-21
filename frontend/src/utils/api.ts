import axios from 'axios';
import { BACKEND } from './conexion';

const api = axios.create({
  baseURL: BACKEND,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.message === 'Network Error') {
      console.warn('Detectado error de red/CORS, intentando con una solución alternativa...');

      const originalRequest = error.config;
      const relativeUrl = originalRequest.url.replace(originalRequest.baseURL, '');

      return axios({
        ...originalRequest,
        baseURL: '',
        url: relativeUrl
      });
    }
    return Promise.reject(error);
  }
);

export const userService = {
  getById: (id: number | string) => api.get(`/api/usuarios/${id}`),
  getAll: (skip = 0, limit = 100) => api.get(`/api/usuarios?skip=${skip}&limit=${limit}`),
};

export default api;