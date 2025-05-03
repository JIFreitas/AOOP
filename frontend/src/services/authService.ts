import axios from 'axios';
import { handleApiError } from './errorHandler';

const API_URL = 'http://localhost:5000/api/auth';

// Interface para usuário
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

// Interface para resposta de login/registro
export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
  error?: string;
}

// Interface para dados de login
export interface LoginData {
  email: string;
  password: string;
}

// Interface para dados de registro
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Interface para dados de atualização de usuário
export interface UpdateUserData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Função para registrar um novo usuário
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    
    if (response.data.success) {
      // Salvar token no localStorage
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    const apiError = handleApiError(error);
    return {
      success: false,
      message: apiError.message,
      error: apiError.type
    };
  }
};

// Função para fazer login
export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    
    if (response.data.success) {
      // Salvar token no localStorage
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    const apiError = handleApiError(error);
    return {
      success: false,
      message: apiError.message,
      error: apiError.type
    };
  }
};

// Função para fazer logout
export const logout = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    
    if (token) {
      await axios.post(`${API_URL}/logout`, { token });
    }
    
    // Remover dados do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return true;
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('Erro ao fazer logout:', apiError.message);
    return false;
  }
};

// Verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// Obter dados do usuário atualmente autenticado
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Obter token do usuário
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Obter dados do perfil do usuário do servidor
export const getUserProfile = async (): Promise<User | null> => {
  try {
    const token = getToken();
    
    if (!token) {
      return null;
    }
    
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      // Atualizar dados do usuário no localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data.user;
    }
    
    return null;
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('Erro ao obter perfil do usuário:', apiError.message);
    return null;
  }
};

// Atualizar dados do usuário
export const updateUserProfile = async (userData: UpdateUserData): Promise<AuthResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      };
    }
    
    const response = await axios.put(`${API_URL}/update`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      // Atualizar dados do usuário no localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    const apiError = handleApiError(error);
    return {
      success: false,
      message: apiError.message,
      error: apiError.type
    };
  }
};

// Configurar interceptor para adicionar token a todas as requisições
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);