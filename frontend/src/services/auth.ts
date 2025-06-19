import api from './axiosInstance';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  carne_identidad: string;
  direccion: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token, user } = response.data;
      
      // Guardar token y usuario
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { access_token, user };
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },
  
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      // Si falla la validación, limpiar datos
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },
  
  // Validar si el token actual es válido
  validateToken: async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      await api.get('/auth/me');
      return true;
    } catch (error) {
      console.log('validaciond e token falló:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  }
};