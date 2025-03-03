// src/api/authApi.js
import api from '../utils/api';
import LoggingService from '../services/LoggingService'; // Adjust path as needed

export const authApi = {
    login: async (credentials) => {
        try {
            LoggingService.debug('Attempting login', { credentials });
            const response = await api.post('/auth/login', credentials);
            LoggingService.info('Login successful', { user: response.data });
            return response.data;
        } catch (error) {
            LoggingService.error('Login failed', { error: error.message, details: error });
            throw error;
        }
    },

    register: async (userData) => {
        try {
            LoggingService.debug('Attempting registration', { userData });
            const response = await api.post('/auth/register', userData);
            LoggingService.info('Registration successful', { user: response.data });
            return response.data;
        } catch (error) {
            LoggingService.error('Registration failed', { error: error.message });
            throw error;
        }
    },

    logout: async () => {
        try {
            LoggingService.debug('Attempting logout');
            const response = await api.post('/auth/logout');
            LoggingService.info('Logout successful');
            return response.data;
        } catch (error) {
            LoggingService.error('Logout failed', { error: error.message });
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            LoggingService.debug('Fetching current user');
            const response = await api.get('/auth/me');
            LoggingService.info('User fetched', { user: response.data });
            return response.data;
        } catch (error) {
            LoggingService.error('Failed to fetch user', { error: error.message });
            throw error;
        }
    }
};

export default authApi;