// src/types/auth.ts

import { User } from './models';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegistrationData) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword?: string;
  companyName: string;
  phoneNumber: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}