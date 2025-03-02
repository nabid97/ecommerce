// Create a temporary AuthChecker.js component
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AuthChecker = () => {
  const [status, setStatus] = useState('Checking...');
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setStatus('No token found');
        return;
      }
      
      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setStatus(`Authenticated as: ${response.data.email || 'User'}`);
      } catch (error) {
        setStatus(`Authentication failed: ${error.message}`);
      }
    };
    
    checkAuth();
  }, []);
  
  return (
    <div style={{ 
      padding: '10px', 
      background: status.includes('Authenticated') ? '#d4edda' : '#f8d7da',
      border: '1px solid #ccc',
      borderRadius: '5px',
      margin: '10px 0'
    }}>
      <h3>Authentication Status</h3>
      <p>{status}</p>
      <p>Token: {localStorage.getItem('token') ? 
          localStorage.getItem('token').substring(0, 20) + '...' : 
          'None'}
      </p>
    </div>
  );
};

export default AuthChecker;