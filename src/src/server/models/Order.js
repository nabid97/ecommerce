const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
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
        type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model('Order', orderSchema);