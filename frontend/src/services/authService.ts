import axios from 'axios';
import { handleApiError } from './errorHandler';

const API_URL = 'https://aoop-q9ib.onrender.com/api/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
  error?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    
    if (response.data.success) {
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

export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    
    if (response.data.success) {
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

export const logout = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    
    if (token) {
      await axios.post(`${API_URL}/logout`, { token });
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return true;
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('Erro ao terminar sessão:', apiError.message);
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

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
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data.user;
    }
    
    return null;
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('Erro ao obter perfil do utilizador:', apiError.message);
    return null;
  }
};

export const updateUserProfile = async (userData: UpdateUserData): Promise<AuthResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Utilizador não autenticado'
      };
    }
    
    const response = await axios.put(`${API_URL}/update`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
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