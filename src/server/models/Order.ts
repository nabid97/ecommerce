// src/server/models/Order.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

// Interfaces for embedded documents
export interface IOrderItemCustomizations {
  size?: string;
  color?: string;
  logo?: Types.ObjectId;
  fabric?: string;
  style?: string;
  [key: string]: any;
}

export interface IOrderItem {
  type: 'fabric' | 'clothing';
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  customizations?: IOrderItemCustomizations;
}

export interface IShippingAddress {
  name: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
}

export interface IPaymentDetails {
  method?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
}

// Main Order interface
export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentDetails?: IPaymentDetails;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    type: {
      type: String,
      enum: ['fabric', 'clothing'],
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'items.type'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    customizations: {
      size: String,
      color: String,
      logo: {
        type: Schema.Types.ObjectId,
        ref: 'Logo'
      },
      fabric: String,
      style: String
    }
  }],
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    companyName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    method: String,
    transactionId: String,
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  notes: String,
  estimatedDelivery: Date
}, {
  timestamps: true
});

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;