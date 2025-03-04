// src/utils/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import LoggingService from './LoggingService';
import AppError from './AppError';

const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for adding authentication token
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log API requests in development
    LoggingService.debug('API Request', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    LoggingService.error('Request Interceptor Error', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log successful responses in development
    LoggingService.debug('API Response', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error: AxiosError): Promise<never> => {
    // Comprehensive error handling
    const processedError = AppError.handleError(error);

    // Special handling for authentication errors
    if (processedError.status === 401) {
      // Remove token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Log the error
    LoggingService.error('API Error', {
      url: error.config?.url,
      method: error.config?.method,
      status: processedError.status,
      message: processedError.message
    });

    return Promise.reject(processedError);
  }
);

export default api;