import axios from 'axios';

const isDev = import.meta.env.DEV;
const currentHost = window.location.hostname;
const getBaseURL = () => {
  const backendIP = import.meta.env.VITE_BACKEND_IP;
  
  if (backendIP) {
    return `http://${backendIP}:8000/api`;
  }

  if (isDev && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:8000/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;