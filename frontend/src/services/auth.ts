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