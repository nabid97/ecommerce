import React, { createContext, useState, useContext, useEffect, FC } from 'react';
import { authService } from '../services/AuthService';
import { User, AuthState, LoginCredentials, RegistrationData } from '../types/auth';
import { ChildrenProps } from '../types/components';

// Create a strongly typed context
const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: FC<ChildrenProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuthStatus = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        // Token might be expired or invalid
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      setError(null);
      const userData = await authService.login(credentials);
      setUser(userData);
      return userData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (registrationData: RegistrationData): Promise<User> => {
    try {
      setError(null);
      const userData = await authService.register(registrationData);
      setUser(userData);
      return userData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('token');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const value: AuthState = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    setUser,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;