// src/types/api.ts

import { Logo, LogoConfig, Fabric, Order, User } from './models';

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
  error?: string;
  status?: string;
}

// Auth API
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

export interface AuthResponse {
  token: string;
  user: User;
}

// Logo API
export interface GenerateLogoRequest {
  prompt?: string;
  config: LogoConfig;
  storage?: {
    bucketName?: string;
    saveToUserProfile?: boolean;
  };
}

export interface GenerateLogoResponse {
  imageUrl: string;
  localUrl?: string;
  message?: string;
  config?: LogoConfig;
  s3Key?: string;
  bucketName?: string;
}

export interface UploadLogoRequest {
  file: File;
  config?: Partial<LogoConfig>;
  bucketName?: string;
  saveToUserProfile?: boolean;
}

export interface UploadLogoResponse {
  logo: {
    imageUrl: string;
    s3Key?: string;
  };
  message: string;
}

export interface GetUserLogosResponse {
  logos: Logo[];
}

// Fabric API
export interface GetFabricsResponse {
  fabrics?: Fabric[];
}

export interface FabricAvailabilityResponse {
  fabricId: string;
  isAvailable: boolean;
  availableQuantity: number;
  requestedQuantity: number;
}

export interface FabricPricingResponse {
  fabricId: string;
  pricePerUnit: number;
  length: number;
  quantity: number;
  total: number;
}

export interface CreateFabricOrderRequest {
  fabricId: string;
  quantity: number;
  length?: number;
  color?: string;
  style?: string;
  logo?: string;
  price?: number;
}

export interface CreateFabricOrderResponse {
  message: string;
  orderId: string;
  fabric: string;
  quantity: number;
  length: number;
  total: number;
}

// Order API
export interface CreateOrderRequest {
  items: {
    id: string;
    quantity: number;
    price: number;
    customizations?: Record<string, any>;
  }[];
  shippingInfo: any;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentDetails?: any;
}

export interface CreateOrderResponse {
  orderId: string;
  message: string;
  [key: string]: any;
}

export interface GetOrderResponse extends Order {}

// Deepseek API interfaces
export interface DeepseekImageGenerationOptions {
  n?: number;
  size?: string;
  response_format?: string;
  model?: string;
  quality?: string;
  style?: string;
}

export interface DeepseekLogoConfig {
  text: string;
  style?: string;
  font?: string;
  color?: string;
  backgroundColor?: string;
  size?: string;
  additionalInstructions?: string;
}

export interface DeepseekResponse {
  created: number;
  data: {
    url: string;
  }[];
}

// Stripe Payment
export interface CreatePaymentIntentRequest {
  items: {
    id: string;
    quantity: number;
    price: number;
  }[];
  shipping: number;
  tax: number;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
}

export interface PaymentIntentSuccessResponse {
  id: string;
  status: string;
  amount: number;
  payment_method_details?: {
    card?: {
      last4?: string;
    };
  };
}