import api from '../utils/api';
import { LoginCredentials, RegistrationData } from '../types/auth';
import { User, AuthResponse } from '../types/models';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return user;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData: RegistrationData): Promise<User> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return user;
    } catch (error) {
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Helper to check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};