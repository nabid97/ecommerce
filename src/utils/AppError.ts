// src/utils/AppError.ts
import { AxiosError } from 'axios';

interface ErrorDetails {
  [key: string]: any;
}

class AppError extends Error {
  status: number;
  details: ErrorDetails;
  isOperational: boolean;

  constructor(message: string, status: number = 500, details: ErrorDetails = {}) {
    super(message);
    this.status = status;
    this.details = details;
    this.isOperational = true;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  // Static method to handle different types of errors
  static handleError(error: any, defaultMessage: string = 'An unexpected error occurred'): AppError {
    // Log error for debugging
    console.error('Error:', error);

    // Extract meaningful error information
    if (error.response) {
      // API error with response
      return new AppError(
        error.response.data?.message || defaultMessage, 
        error.response.status, 
        error.response.data || {}
      );
    } else if (error.request) {
      // Network error or no response
      return new AppError('Network error. Please check your connection.', 503);
    } else if (error instanceof AppError) {
      // Already an AppError instance
      return error;
    } else {
      // Generic error
      return new AppError(error.message || defaultMessage, 500);
    }
  }

  // Utility method to display user-friendly error messages
  static getUserMessage(error: any): string {
    const knownErrors: Record<number, string> = {
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