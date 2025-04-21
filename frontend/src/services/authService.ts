import axiosInstance from './axiosInstance';
import { LoginCredentials, RegisterData, User } from './auth';

export const authService = {
  async login(credentials: LoginCredentials) {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await axiosInstance.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    
    return access_token;
  },
  
  async register(data: RegisterData) {
    const response = await axiosInstance.post('/api/auth/register', data);
    return response.data;
  },
  
  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  },
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};