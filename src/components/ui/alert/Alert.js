import React from 'react';

export const Alert = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-blue-50 text-blue-900 p-4 rounded-md ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm ${className}`} {...props}>
      {children}
    </p>
  );
};