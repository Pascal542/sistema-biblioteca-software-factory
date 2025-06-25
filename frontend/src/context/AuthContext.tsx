import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/axiosInstance';

interface AuthContextType {
  user: { email: string; rol: string; nombre?: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ email: string; rol: string }>;
  logout: () => void;
  checkAuth: () => boolean;
  role: string | null;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => ({ email: '', rol: '' }),
  logout: () => {},
  checkAuth: () => false,
  role: null
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; rol: string; nombre?: string } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        username: email,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token } = response.data;
      
      if (!access_token) {
        throw new Error('Token no recibido del servidor');
      }
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      const payload = JSON.parse(atob(access_token.split('.')[1]));
      const userData = { 
        email: payload.sub, 
        rol: payload.rol,
        nombre: payload.nombre || 'Usuario'
      };
      
      setUser(userData);
      setRole(userData.rol);
      setIsAuthenticated(true);
      
      return userData;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const checkAuth = () => {
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      setIsAuthenticated(false);
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      
      if (Date.now() >= expirationTime) {
        logout();
        return false;
      }
      
      const userData = { 
        email: payload.sub, 
        rol: payload.rol,
        nombre: payload.nombre || 'Usuario'
      };
      setUser(userData);
      setRole(userData.rol);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error al verificar token:', error);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated, 
      login, 
      logout, 
      checkAuth,
      role
    }}>
      {children}
    </AuthContext.Provider>
  );
};