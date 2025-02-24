import React from 'react';

export const Alert = ({ children, className = '', variant = 'info', ...props }) => {
  const variantClasses = {
    info: 'bg-blue-50 text-blue-900',
    error: 'bg-red-50 text-red-900',
    success: 'bg-green-50 text-green-900',
    warning: 'bg-yellow-50 text-yellow-900'
  };

  return (
    <div 
      className={`p-4 rounded-md ${variantClasses[variant]} ${className}`}
      role="alert"
      data-testid="alert"
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertDescription = ({ children, className = '', ...props }) => {
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