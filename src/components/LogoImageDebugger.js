// src/components/LogoImageDebugger.js
import React, { useState, useEffect } from 'react';

const LogoImageDebugger = ({ imageUrl }) => {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState({});
  
  useEffect(() => {
    if (!imageUrl) {
      setStatus('no-url');
      return;
    }
    
    // Check if it's a valid URL or blob URL
    const isUrlValid = () => {
      try {
        new URL(imageUrl);
        return true;
      } catch (e) {
        return false;
      }
    };
    
    const checkImageUrl = async () => {
      setStatus('checking');
      
      try {
        // First check if it's a valid URL format
        if (!isUrlValid()) {
          setStatus('invalid-url');
          setDetails({ 
            error: 'Invalid URL format',
            url: imageUrl
          });
          return;
        }
        
        // Then try to actually load the image
        const img = new Image();
        
        // Set up load and error handlers
        img.onload = () => {
          setStatus('success');
          setDetails({
            width: img.width,
            height: img.height,
            aspectRatio: (img.width / img.height).toFixed(2),
            url: imageUrl
          });
        };
        
        img.onerror = () => {
          setStatus('failed');
          setDetails({
            error: 'Failed to load image',
            url: imageUrl
          });
        };
        
        // Start loading the image
        img.src = imageUrl;
      } catch (err) {
        setStatus('error');
        setDetails({
          error: err.message,
          url: imageUrl
        });
      }
    };
    
    checkImageUrl();
  }, [imageUrl]);
  
  // Determine status badge color
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'invalid-url': return 'bg-red-100 text-red-800';
      case 'no-url': return 'bg-yellow-100 text-yellow-800';
      case 'checking': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="p-3 border rounded bg-gray-50 text-sm">
      <div className="flex items-center mb-2">
        <span className="font-medium">Logo Image Debug:</span>
        <span className={`ml-2 px-2 py-1 rounded ${getStatusColor()}`}>
          {status === 'checking' ? 'Checking...' : 
           status === 'success' ? 'Valid' :
           status === 'failed' ? 'Failed to Load' :
           status === 'invalid-url' ? 'Invalid URL' :
           status === 'no-url' ? 'No URL Provided' : 'Error'}
        </span>
      </div>
      
      <div className="mt-2 whitespace-normal break-words border-t pt-2">
        <p className="text-xs text-gray-600 mb-1">URL:</p>
        <code className="text-xs block bg-gray-100 p-1 rounded overflow-x-auto">
          {imageUrl || '(none)'}
        </code>
      </div>
      
      {status === 'success' && (
        <div className="mt-2">
          <p className="text-xs">Dimensions: {details.width}×{details.height} (Aspect: {details.aspectRatio})</p>
        </div>
      )}
      
      {(status === 'failed' || status === 'invalid-url' || status === 'error') && (
        <div className="mt-2 text-red-600 text-xs">
          <p>{details.error}</p>
        </div>
      )}
    </div>
  );
};

export default LogoImageDebugger;