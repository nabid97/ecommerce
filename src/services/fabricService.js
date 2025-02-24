import axios from 'axios';

// Define API base URL with fallback - ensures the service works even if environment variable isn't set
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Create a custom axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  // Set default headers that will be sent with every request
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  // Enable sending cookies and authentication headers
  withCredentials: true,
  // Set a reasonable timeout
  timeout: 10000
});

// Request interceptor - logs and modifies outgoing requests
api.interceptors.request.use(
  (config) => {
    // Log detailed information about the outgoing request
    console.log(`
      ===== Outgoing API Request =====
      • URL: ${config.url}
      • Method: ${config.method?.toUpperCase()}
      • Base URL: ${config.baseURL}
      • Headers: ${JSON.stringify(config.headers)}
      • Data: ${config.data ? JSON.stringify(config.data).substring(0, 200) + '...' : 'No data'}
      • Timestamp: ${new Date().toISOString()}
      ==============================
    `);

    return config;
  },
  (error) => {
    // Log any errors that occur during request configuration
    console.error('Request Configuration Error:', {
      message: error.message,
      stack: error.stack,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// Response interceptor - handles responses and errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`
      ===== API Response Success =====
      • URL: ${response.config.url}
      • Status: ${response.status}
      • Status Text: ${response.statusText}
      • Data Preview: ${JSON.stringify(response.data).substring(0, 200)}...
      • Timestamp: ${new Date().toISOString()}
      ==============================
    `);
    return response;
  },
  (error) => {
    // Handle different types of errors appropriately
    if (error.response) {
      // Server responded with an error status code
      console.error('API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config.url,
        method: error.config.method,
        timestamp: new Date().toISOString()
      });

      // Handle specific error status codes
      switch (error.response.status) {
        case 401:
          console.log('Authentication error - redirecting to login...');
          // You could trigger a redirect to login here
          break;
        case 403:
          console.log('Authorization error - user lacks permission');
          break;
        case 404:
          console.log('Resource not found');
          break;
        case 429:
          console.log('Rate limit exceeded - implementing backoff');
          break;
        default:
          console.log('Unhandled error status:', error.response.status);
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error('Network Error:', {
        message: 'No response received from server',
        request: {
          url: error.config.url,
          method: error.config.method,
          timeout: error.config.timeout
        },
        timestamp: new Date().toISOString()
      });
    } else {
      // Error in request configuration
      console.error('Request Setup Error:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }

    return Promise.reject(error);
  }
);

// Mock data for development and fallback
const mockFabrics = [
  {
    id: 'cotton',
    name: 'Cotton',
    description: 'Soft, breathable natural fabric',
    minOrder: 50,
    price: 5.99,
    colors: ['white', 'black', 'navy', 'grey'],
    styles: ['plain', 'twill', 'jersey']
  },
  {
    id: 'polyester',
    name: 'Polyester',
    description: 'Durable synthetic fabric',
    minOrder: 100,
    price: 4.99,
    colors: ['white', 'black', 'red', 'blue'],
    styles: ['plain', 'satin', 'textured']
  }
];

// Service object containing all fabric-related API calls
export const fabricService = {
  // Fetch all fabric types with optional filtering
  getFabricTypes: async (filters = {}) => {
    try {
      console.log('Fetching fabrics with filters:', filters);
      
      const response = await api.get('/api/fabrics', { 
        params: filters,
        // Set a specific timeout for this request if needed
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching fabrics:', {
        error: error.message,
        filters,
        timestamp: new Date().toISOString()
      });

      // In development, return mock data instead of failing
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning mock data for development');
        return mockFabrics;
      }

      // In production, rethrow the error to be handled by the component
      throw error;
    }
  },

  // Get detailed pricing information for a fabric
  getPricing: async (fabricId, length, quantity) => {
    try {
      const response = await api.get(`/api/fabrics/${fabricId}/pricing`, {
        params: { length, quantity }
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating pricing:', {
        fabricId,
        length,
        quantity,
        error: error.message
      });

      // In development, return mock pricing
      if (process.env.NODE_ENV === 'development') {
        return {
          total: length * quantity * 5.99,
          breakdown: {
            basePrice: 5.99,
            quantity,
            length,
            discounts: 0
          }
        };
      }
      throw error;
    }
  },

  // Place an order for fabric
  placeOrder: async (orderData) => {
    try {
      const response = await api.post('/api/fabrics/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error placing order:', {
        orderData,
        error: error.message
      });
      throw error;
    }
  }
};

export default fabricService;