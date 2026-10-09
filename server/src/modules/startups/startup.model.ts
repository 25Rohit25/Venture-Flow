import mongoose, { Document, Schema, Types } from 'mongoose';

export type IndustryType = 'FINTECH' | 'HEALTHTECH' | 'EDTECH' | 'SAAS' | 'ECOMMERCE' | 'OTHER';
export type StageType = 'IDEA' | 'MVP' | 'EARLY_REVENUE' | 'GROWTH';
export type StartupStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface IStartup extends Document {
  _id: Types.ObjectId;
  founderId: Types.ObjectId;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  industry: IndustryType;
  stage: StageType;
  targetAmount: number;
  location?: string;
  status: StartupStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const startupSchema = new Schema<IStartup>(
  {
    founderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 100,
      maxlength: 4000,
    },
    industry: {
      type: String,
      enum: ['FINTECH', 'HEALTHTECH', 'EDTECH', 'SAAS', 'ECOMMERCE', 'OTHER'],
      required: true,
    },
    stage: {
      type: String,
      enum: ['IDEA', 'MVP', 'EARLY_REVENUE', 'GROWTH'],
      required: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 10000,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer INR value',
      },
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      required: true,
      index: true,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes per spec:
// 1. Founder startup query index
startupSchema.index({ founderId: 1, createdAt: -1 });
// 2. Discovery compound index
startupSchema.index({ status: 1, industry: 1, stage: 1, createdAt: -1 });

export const StartupModel = mongoose.model<IStartup>('Startup', startupSchema);
