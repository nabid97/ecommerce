// src/server/models/Fabric.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// Interfaces for embedded documents
export interface IFabricColor {
  name: string;
  code: string;
  inStock: boolean;
}

export interface IFabricStyle {
  name: string;
  description: string;
  additionalCost: number;
}

export interface IFabricImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface IFabricSpecifications {
  weight?: string;
  width?: string;
  composition?: string;
  careInstructions?: string[];
}

export interface IFabricStock {
  available: number;
  reserved: number;
  reorderPoint: number;
}

export interface IFabricMetadata {
  searchTags?: string[];
  categories?: string[];
  [key: string]: any;
}

// Main Fabric interface
export interface IFabric extends Document {
  id?: string; // String ID field for lookups
  name: string;
  description: string;
  type: string;
  colors: IFabricColor[];
  price: number;
  minOrderQuantity: number;
  availableStyles?: IFabricStyle[];
  images?: IFabricImage[];
  specifications?: IFabricSpecifications;
  stock: IFabricStock;
  status: 'active' | 'inactive' | 'discontinued';
  metadata?: IFabricMetadata;
  isQuantityAvailable: (quantity: number) => boolean;
  reserveQuantity: (quantity: number) => Promise<IFabric>;
  availableQuantity?: number;
}

// Fabric Model Interface
interface IFabricModel extends Model<IFabric> {
  findByAnyId: (id: string) => Promise<IFabric | null>;
}

const fabricSchema = new Schema<IFabric>({
  // Add a string ID field that can be used for lookups
  id: {
    type: String,
    unique: true,
    sparse: true  // Allow null/undefined values
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['cotton', 'polyester', 'silk', 'linen', 'blend']
  },
  colors: [{
    name: String,
    code: String,
    inStock: {
      type: Boolean,
      default: true
    }
  }],
  price: {
    type: Number,
    required: true
  },
  minOrderQuantity: {
    type: Number,
    required: true,
    default: 50
  },
  availableStyles: [{
    name: String,
    description: String,
    additionalCost: {
      type: Number,
      default: 0
    }
  }],
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  specifications: {
    weight: String,
    width: String,
    composition: String,
    careInstructions: [String]
  },
  stock: {
    available: {
      type: Number,
      required: true
    },
    reserved: {
      type: Number,
      default: 0
    },
    reorderPoint: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  metadata: {
    searchTags: [String],
    categories: [String]
  }
}, {
  timestamps: true
});

// Virtual for available quantity
fabricSchema.virtual('availableQuantity').get(function(this: IFabric) {
  return this.stock.available - this.stock.reserved;
});

// Method to check if quantity is available
fabricSchema.methods.isQuantityAvailable = function(this: IFabric, requestedQuantity: number): boolean {
  return this.stock.available >= requestedQuantity;
};

// Method to reserve quantity
fabricSchema.methods.reserveQuantity = async function(this: IFabric, quantity: number): Promise<IFabric> {
  if (!this.isQuantityAvailable(quantity)) {
    throw new Error('Insufficient quantity available');
  }
  
  this.stock.reserved += quantity;
  return this.save();
};

// Static method to find by string ID or ObjectId
fabricSchema.statics.findByAnyId = async function(this: IFabricModel, id: string): Promise<IFabric | null> {
  // First try as ObjectId
  try {
    const byObjectId = await this.findById(id);
    if (byObjectId) return byObjectId;
  } catch (err) {
    // Invalid ObjectId, continue to other lookups
  }
  
  // Then try by string id field
  const byStringId = await this.findOne({ id: id });
  if (byStringId) return byStringId;
  
  // Finally try by other identifiers
  return await this.findOne({ $or: [{ code: id }, { 'metadata.sku': id }] });
};

const Fabric = mongoose.model<IFabric, IFabricModel>('Fabric', fabricSchema);

export default Fabric;