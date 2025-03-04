// src/types/components.ts

import { ReactNode, MouseEventHandler } from 'react';
import { CartItem, LogoConfig, Logo } from './models';

// General
export interface ChildrenProps {
  children: ReactNode;
}

// UI Components
export interface CardProps extends ChildrenProps {
  className?: string;
  variant?: 'default' | 'bordered' | 'flat' | 'elevated' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  onClick?: MouseEventHandler<HTMLDivElement>;
  [key: string]: any;
}

export interface CardHeaderProps extends ChildrenProps {
  className?: string;
  variant?: 'default' | 'transparent' | 'colored' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gradient';
  [key: string]: any;
}

export interface CardTitleProps extends ChildrenProps {
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  [key: string]: any;
}

export interface CardDescriptionProps extends ChildrenProps {
  className?: string;
  [key: string]: any;
}

export interface CardContentProps extends ChildrenProps {
  className?: string;
  padded?: boolean;
  [key: string]: any;
}

export interface CardFooterProps extends ChildrenProps {
  className?: string;
  variant?: 'default' | 'transparent' | 'colored' | 'sticky' | 'flex';
  [key: string]: any;
}

export interface CardActionsProps extends ChildrenProps {
  className?: string;
  align?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  [key: string]: any;
}

export interface CardDividerProps {
  className?: string;
  [key: string]: any;
}

export interface CardImageProps {
  src: string;
  alt?: string;
  position?: 'top' | 'bottom' | null;
  className?: string;
  [key: string]: any;
}

export interface AlertProps extends ChildrenProps {
  className?: string;
  variant?: 'info' | 'error' | 'success' | 'warning';
  [key: string]: any;
}

export interface AlertDescriptionProps extends ChildrenProps {
  className?: string;
  [key: string]: any;
}

// Cart Context
export interface CartContextProps {
  cart: CartItem[];
  total: number;
  itemCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string, customizations?: Record<string, any>) => void;
  updateQuantity: (itemId: string, customizations: Record<string, any> | undefined, quantity: number) => void;
  clearCart: () => void;
  isInCart: (itemId: string, customizations?: Record<string, any>) => boolean;
  getItemQuantity: (itemId: string, customizations?: Record<string, any>) => number;
}

// Logo Generator Component
export interface LogoGeneratorProps {
  onLogoGenerate?: (logoUrl: string) => void;
}

// Clothing Visualizer Component
export interface ClothingVisualizerProps {
  clothingType?: string;
  color?: string;
  logoPosition?: string;
  logoSize?: string;
  logoImage?: string | null;
}

// Image Uploader Component
export interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
}

// User Logo Gallery Component
export interface UserLogoGalleryProps {
  logos?: Logo[];
  loading?: boolean;
  error?: string | null;
}

// Logo Image Debugger Component
export interface LogoImageDebuggerProps {
  imageUrl: string;
}

// Navigation Component
export interface NavigationProps {}

// Layout Component
export interface LayoutProps extends ChildrenProps {}

// Product Gallery Component
export interface ProductGalleryProps {
  filters?: {
    type?: string;
    color?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
    sort?: string;
  };
}

// Shopping Cart View Component
export interface ShoppingCartViewProps {}

// Server Connection Check Component
export interface ServerConnectionCheckProps {
  onConnectionChange: (connected: boolean) => void;
}

// Form interfaces
export interface CheckoutFormProps {
  clientSecret: string;
  orderData: any;
  onSuccess: (paymentIntent: any) => void;
}

export interface ProductConfigState {
  clothingType: string;
  color: string;
  size: string;
  fabric: string;
  quantity: number;
  style: string;
  customDescription?: string;
  logoPosition: string;
  logoSize: string;
  generateImage: boolean;
  colorSelectionMode: 'preset' | 'custom';
  customColorHex: string;
  customColor?: string;
  customFabric?: string;
  customStyle?: string;
  customSize?: string;
  customLogoPosition?: string;
  customLogoSize?: string;
}

export interface FabricConfigState {
  type: string;
  color: string;
  length: number;
  style: string;
  quantity: number;
  logo?: string | null;
}

export interface OrderSummaryState {
  fabric?: string;
  clothingType?: string;
  color?: string;
  style?: string;
  length?: number;
  quantity?: number;
  totalPrice?: number;
  unitPrice?: number;
  subtotal?: number;
  tax?: number;
  total?: number;
  orderId?: string;
  size?: string;
}

export interface ShippingInfoState {
  name: string;
  companyName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
}