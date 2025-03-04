// src/api/authApi.ts
import api from '../utils/api';
import LoggingService from '../utils/LoggingService';
import { LoginCredentials, RegistrationData } from '../types/auth';
import { User, AuthResponse } from '../types/models';

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<User> => {
        try {
            LoggingService.debug('Attempting login', { credentials });
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            LoggingService.info('Login successful', { user });
            return user;
        } catch (error) {
            LoggingService.error('Login failed', { error: (error as Error).message, details: error });
            throw error;
        }
    },

    register: async (userData: RegistrationData): Promise<User> => {
        try {
            LoggingService.debug('Attempting registration', { userData });
            const response = await api.post<AuthResponse>('/auth/register', userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            LoggingService.info('Registration successful', { user });
            return user;
        } catch (error) {
            LoggingService.error('Registration failed', { error: (error as Error).message });
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            LoggingService.debug('Attempting logout');
            const response = await api.post('/auth/logout');
            LoggingService.info('Logout successful');
            return response.data;
        } catch (error) {
            LoggingService.error('Logout failed', { error: (error as Error).message });
            throw error;
        }
    },

    getCurrentUser: async (): Promise<User> => {
        try {
            LoggingService.debug('Fetching current user');
            const response = await api.get<User>('/auth/me');
            LoggingService.info('User fetched', { user: response.data });
            return response.data;
        } catch (error) {
            LoggingService.error('Failed to fetch user', { error: (error as Error).message });
            throw error;
        }
    }
};

export default authApi;