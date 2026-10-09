import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'FOUNDER' | 'INVESTOR';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Hidden by default from queries
    },
    role: {
      type: String,
      enum: ['FOUNDER', 'INVESTOR'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Explicit safe user serializer
export function toSafeUser(user: IUser): SafeUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

export const UserModel = mongoose.model<IUser>('User', userSchema);
