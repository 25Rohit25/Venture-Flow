import mongoose, { Document, Schema, Types } from 'mongoose';

export type InterestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';

export interface IInterest extends Document {
  _id: Types.ObjectId;
  startupId: Types.ObjectId;
  investorId: Types.ObjectId;
  message: string;
  status: InterestStatus;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const interestSchema = new Schema<IInterest>(
  {
    startupId: {
      type: Schema.Types.ObjectId,
      ref: 'Startup',
      required: true,
      index: true,
    },
    investorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN'],
      default: 'PENDING',
      required: true,
      index: true,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Critical compound unique index: exactly one interest document per startup/investor pair
interestSchema.index({ startupId: 1, investorId: 1 }, { unique: true });

export const InterestModel = mongoose.model<IInterest>('Interest', interestSchema);
