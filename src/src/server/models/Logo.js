const mongoose = require('mongoose');

const logoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: true
  },
  config: {
    text: String,
    color: String,
    size: String,
    style: String,
    font: String,
    backgroundColor: String
  },
  prompt: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['generated', 'uploaded'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  metadata: {
    originalName: String,
    fileSize: Number,
    mimeType: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Logo', logoSchema);