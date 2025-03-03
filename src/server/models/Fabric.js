// src/server/models/Fabric.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fabricSchema = new Schema({
  // String ID for user-friendly identification
  id: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, 'A fabric must have a name'],
    trim: true,
    maxlength: [40, 'A fabric name must have less or equal than 40 characters'],
    minlength: [3, 'A fabric name must have more or equal than 3 characters']
  },
  description: {
    type: String,
    required: [true, 'A fabric must have a description']
  },
  type: {
    type: String,
    required: [true, 'A fabric must have a type'],
    enum: {
      values: ['cotton', 'polyester', 'silk', 'linen', 'blend', 'wool', 'denim'],
      message: 'Type must be one of: cotton, polyester, silk, linen, blend, wool, denim'
    }
  },
  colors: [{
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    inStock: {
      type: Boolean,
      default: true
    }
  }],
  price: {
    type: Number,
    required: [true, 'A fabric must have a price'],
    min: [0, 'Price must be above 0']
  },
  minOrderQuantity: {
    type: Number,
    required: true,
    default: 50,
    min: [1, 'Minimum order quantity must be at least 1']
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
      required: true,
      min: [0, 'Available stock cannot be negative']
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved stock cannot be negative']
    },
    reorderPoint: {
      type: Number,
      required: true,
      min: [0, 'Reorder point cannot be negative']
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  metadata: {
    searchTags: [String],
    categories: [String],
    supplier: {
      name: String,
      code: String,
      contactInfo: String
    },
    sku: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// VIRTUAL PROPERTIES
fabricSchema.virtual('availableQuantity').get(function() {
  return this.stock.available - this.stock.reserved;
});

fabricSchema.virtual('isLowStock').get(function() {
  return this.availableQuantity <= this.stock.reorderPoint;
});

// DOCUMENT MIDDLEWARE
fabricSchema.pre('save', function(next) {
  // Generate an ID if not provided
  if (!this.id) {
    this.id = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

// METHODS
fabricSchema.methods.isQuantityAvailable = function(requestedQuantity) {
  return this.availableQuantity >= requestedQuantity;
};

fabricSchema.methods.reserveQuantity = async function(quantity) {
  if (!this.isQuantityAvailable(quantity)) {
    throw new Error('Insufficient quantity available');
  }
  
  this.stock.reserved += quantity;
  return this.save();
};

fabricSchema.methods.releaseReservedQuantity = async function(quantity) {
  const amountToRelease = Math.min(quantity, this.stock.reserved);
  this.stock.reserved -= amountToRelease;
  return this.save();
};

fabricSchema.methods.deductFromInventory = async function(quantity) {
  if (this.stock.available < quantity) {
    throw new Error('Insufficient stock available');
  }
  
  // First try to use reserved quantity
  const reservedToUse = Math.min(quantity, this.stock.reserved);
  this.stock.reserved -= reservedToUse;
  this.stock.available -= quantity;
  
  return this.save();
};

// STATIC METHODS
fabricSchema.statics.findByAnyId = async function(id) {
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
  return await this.findOne({ $or: [{ 'metadata.sku': id }, { name: { $regex: new RegExp(`^${id}$`, 'i') } }] });
};

const Fabric = mongoose.model('Fabric', fabricSchema);

module.exports = Fabric;