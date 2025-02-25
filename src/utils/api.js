import axios from 'axios';
import LoggingService from './LoggingService';
import AppError from './AppError';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
<<<<<<< HEAD
  withCredentials: true,  // Important for CORS
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: config.data
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config
    });
=======
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for adding authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
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
  (error) => {
    LoggingService.error('Request Interceptor Error', error);
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    LoggingService.debug('API Response', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
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