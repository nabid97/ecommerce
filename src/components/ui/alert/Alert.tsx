import React, { FC } from 'react';
import { AlertProps, AlertDescriptionProps } from '../../../types/components';

/**
 * Alert component for displaying notifications and messages
 */
export const Alert: FC<AlertProps> = ({ 
  children, 
  className = '', 
  variant = 'info', 
  ...props 
}) => {
  // Map of variant classes for different alert types
  const variantClasses: Record<string, string> = {
    info: 'bg-blue-50 text-blue-900',
    error: 'bg-red-50 text-red-900',
    success: 'bg-green-50 text-green-900',
    warning: 'bg-yellow-50 text-yellow-900'
  };

  // Get the class for the specified variant, fallback to info if not found
  const variantClass = variantClasses[variant] || variantClasses.info;

  return (
    <div 
      className={`p-4 rounded-md ${variantClass} ${className}`}
      role="alert"
      data-testid="alert"
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * AlertDescription component for text content within an alert
 */
export const AlertDescription: FC<AlertDescriptionProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <p 
      className={`text-sm ${className}`}
      data-testid="alert-description"
      {...props}
    >
      {children}
    </p>
  );
};