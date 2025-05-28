import api from '../services/axiosInstance';

export const userService = {
  getById: (id: number | string) => api.get(`/usuarios/${id}`),
  getAll: (skip = 0, limit = 100) => api.get(`/usuarios?skip=${skip}&limit=${limit}`),
};

interface RegisterData {
  username: string;
  password: string;
  email: string;
  nombre?: string;
  apellido?: string;
  carneIdentidad?: string;
  rol?: string;
}

export const authService = {
  login: (credentials: { username: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (data: RegisterData) => 
    api.post('/auth/register', data),
  me: () => 
    api.get('/auth/me'),
};

export const materialService = {
  getAll: (skip = 0, limit = 100) => 
    api.get(`/materiales?skip=${skip}&limit=${limit}`),
  getById: (id: number) => 
    api.get(`/materiales/${id}`),
  getLibros: (skip = 0, limit = 100) => 
    api.get(`/materiales/libros/?skip=${skip}&limit=${limit}`),
  getRevistas: (skip = 0, limit = 100) => 
    api.get(`/materiales/revistas/?skip=${skip}&limit=${limit}`),
  getActas: (skip = 0, limit = 100) => 
    api.get(`/materiales/actas/?skip=${skip}&limit=${limit}`),
  getDisponibles: () => 
    api.get('/materiales/disponibles'),
};

interface SolicitudData {
  materialId: number;
  carneIdentidad: string;
  fechaSolicitud?: string;
  estado?: string;
  observaciones?: string;
}

export const solicitudService = {
  getAll: (estado?: string) => {
    const url = estado ? `/solicitudes?estado=${estado}` : '/solicitudes';
    return api.get(url);
  },
  getByCliente: (carneIdentidad: string) => 
    api.get(`/solicitudes/cliente/${carneIdentidad}`),
  create: (data: SolicitudData) => 
    api.post('/solicitudes', data),
  update: (id: number, data: Partial<SolicitudData>) => 
    api.put(`/solicitudes/${id}`, data),
};

export const prestamoService = {
  getByCliente: (carneIdentidad: string) => 
    api.get(`/prestamos/cliente/${carneIdentidad}`),
};

export default api;