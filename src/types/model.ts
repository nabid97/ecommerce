// src/types/models.ts

// User model
export interface User {
    _id: string;
    email: string;
    password?: string; // Optional as it might not be returned from API
    comparePassword?: (password: string) => Promise<boolean>;
  }
  
  // Logo model
  export interface Logo {
    _id: string;
    userId?: string;
    imageUrl: string;
    s3Key?: string;
    bucketName?: string;
    config?: LogoConfig;
    prompt?: string;
    type: 'generated' | 'uploaded';
    status: 'pending' | 'completed' | 'failed';
    metadata?: {
      originalName?: string;
      fileSize?: number;
      mimeType?: string;
      [key: string]: any;
    };
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface LogoConfig {
    text?: string;
    color?: string;
    backgroundColor?: string;
    size?: 'small' | 'medium' | 'large' | string;
    style?: 'modern' | 'classic' | 'minimalist' | 'bold' | 'elegant' | string;
    font?: string;
    textEffect?: string;
    additionalInstructions?: string;
    [key: string]: any;
  }
  
  // Fabric model
  export interface Fabric {
    _id?: string;
    id?: string;
    name: string;
    description: string;
    type: 'cotton' | 'polyester' | 'silk' | 'linen' | 'blend' | string;
    colors: FabricColor[] | string[];
    price: number;
    minOrderQuantity: number;
    availableStyles?: FabricStyle[];
    styles?: string[];
    images?: FabricImage[];
    specifications?: {
      weight?: string;
      width?: string;
      composition?: string;
      careInstructions?: string[];
    };
    stock: {
      available: number;
      reserved: number;
      reorderPoint: number;
    };
    status: 'active' | 'inactive' | 'discontinued';
    metadata?: {
      searchTags?: string[];
      categories?: string[];
      [key: string]: any;
    };
    isQuantityAvailable?: (quantity: number) => boolean;
    reserveQuantity?: (quantity: number) => Promise<Fabric>;
    availableQuantity?: number;
  }
  
  export interface FabricColor {
    name: string;
    code: string;
    inStock: boolean;
  }
  
  export interface FabricStyle {
    name: string;
    description: string;
    additionalCost: number;
  }
  
  export interface FabricImage {
    url: string;
    alt: string;
    isPrimary: boolean;
  }
  
  // Order model
  export interface Order {
    _id?: string;
    orderId?: string;
    userId: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentDetails?: PaymentDetails;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    notes?: string;
    estimatedDelivery?: string | Date;
    createdAt?: string;
    updatedAt?: string;
    orderDate?: string;
  }
  
  export interface OrderItem {
    type: 'fabric' | 'clothing';
    productId: string;
    quantity: number;
    price: number;
    customizations?: {
      size?: string;
      color?: string;
      logo?: boolean | string;
      fabric?: string;
      style?: string;
      length?: number;
      logoPosition?: string;
      logoSize?: string;
      [key: string]: any;
    };
    name?: string;
    image?: string;
  }
  
  export interface ShippingAddress {
    name: string;
    companyName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
    email?: string;
  }
  
  export interface PaymentDetails {
    method?: string;
    transactionId?: string;
    amount?: number;
    currency?: string;
    id?: string;
    status?: string;
    last4?: string;
  }
  
  // Cart Item
  export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
    customizations?: {
      color?: string;
      style?: string;
      length?: number;
      quantity?: number;
      size?: string;
      fabric?: string;
      logo?: boolean | string;
      [key: string]: any;
    };
    orderId?: string;
  }