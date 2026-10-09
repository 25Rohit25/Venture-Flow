import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBookmark extends Document {
  _id: Types.ObjectId;
  startupId: Types.ObjectId;
  investorId: Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Critical compound unique index: exactly one bookmark document per startup/investor pair
bookmarkSchema.index({ startupId: 1, investorId: 1 }, { unique: true });

export const BookmarkModel = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
