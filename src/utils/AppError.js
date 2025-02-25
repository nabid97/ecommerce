class AppError extends Error {
<<<<<<< HEAD
  constructor(message, status = 500, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static handleError(error, defaultMessage = 'An unexpected error occurred') {
    console.error('Full error details:', error);

    // More detailed error handling
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      return new AppError(
        error.response.data.message || defaultMessage, 
        error.response.status, 
        error.response.data
      );
    } else if (error.request) {
      console.error('Request error:', error.request);
      return new AppError('No response received from server', 503);
    } else {
      console.error('Error details:', error.message, error.stack);
      return new AppError(error.message || defaultMessage, 500);
    }
  }
}

export default AppError;
=======
    constructor(message, status = 500, details = {}) {
      super(message);
      this.status = status;
      this.details = details;
      this.isOperational = true;
  
      // Maintains proper stack trace for where our error was thrown
      Error.captureStackTrace(this, this.constructor);
    }
  
    // Static method to handle different types of errors
    static handleError(error, defaultMessage = 'An unexpected error occurred') {
      // Log error for debugging
      console.error('Error:', error);
  
      // Extract meaningful error information
      if (error.response) {
        // API error with response
        return new AppError(
          error.response.data.message || defaultMessage, 
          error.response.status, 
          error.response.data
        );
      } else if (error.request) {
        // Network error or no response
        return new AppError('Network error. Please check your connection.', 503);
      } else {
        // Generic error
        return new AppError(error.message || defaultMessage, 500);
      }
    }
  
    // Utility method to display user-friendly error messages
    static getUserMessage(error) {
      const knownErrors = {
        400: 'Invalid request. Please check your input.',
        401: 'Unauthorized. Please log in again.',
        403: 'You do not have permission to perform this action.',
        404: 'The requested resource was not found.',
        500: 'Server error. Please try again later.',
        503: 'Service unavailable. Please try again later.'
      };
  
      const operationalError = this.handleError(error);
      return knownErrors[operationalError.status] || operationalError.message;
    }
  }
  
  export default AppError;
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
