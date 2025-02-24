class AppError extends Error {
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