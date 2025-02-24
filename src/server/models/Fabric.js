// src/server/models/Fabric.js
const mongoose = require('mongoose');

const fabricSchema = new mongoose.Schema({
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
fabricSchema.virtual('availableQuantity').get(function() {
  return this.stock.available - this.stock.reserved;
});

// Method to check if quantity is available
fabricSchema.methods.isQuantityAvailable = function(requestedQuantity) {
  return this.stock.available >= requestedQuantity;
};

// Method to reserve quantity
fabricSchema.methods.reserveQuantity = async function(quantity) {
  if (!this.isQuantityAvailable(quantity)) {
    throw new Error('Insufficient quantity available');
  }
  
  this.stock.reserved += quantity;
  return this.save();
};

// Static method to find by string ID or ObjectId
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
  return await this.findOne({ $or: [{ code: id }, { 'metadata.sku': id }] });
};

module.exports = mongoose.model('Fabric', fabricSchema);