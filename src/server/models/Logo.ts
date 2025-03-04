import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for Logo Config
export interface ILogoConfig {
  text?: string;
  color?: string;
  size?: string;
  style?: string;
  font?: string;
  backgroundColor?: string;
  [key: string]: any;
}

// Interface for Logo metadata
export interface ILogoMetadata {
  originalName?: string;
  fileSize?: number;
  mimeType?: string;
  [key: string]: any;
}

// Interface for Logo document
export interface ILogo extends Document {
  userId?: Types.ObjectId;
  imageUrl: string;
  s3Key?: string;
  config?: ILogoConfig;
  prompt?: string;
  type: 'generated' | 'uploaded';
  status: 'pending' | 'completed' | 'failed';
  metadata?: ILogoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const logoSchema = new Schema<ILogo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // Make userId optional by not including required: true
    },
    imageUrl: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      // Make s3Key optional by not including required: true
    },
    config: {
      text: String,
      color: String,
      size: String,
      style: String,
      font: String,
      backgroundColor: String,
    },
    prompt: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['generated', 'uploaded'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    metadata: {
      originalName: String,
      fileSize: Number,
      mimeType: String,
    },
  },
  {
    timestamps: true,
  }
);

const Logo = mongoose.model<ILogo>('Logo', logoSchema);

export default Logo;