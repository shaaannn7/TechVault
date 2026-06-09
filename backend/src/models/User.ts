import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: 'user' | 'admin' | 'moderator';
  isVerified: boolean;
  isActive: boolean;
  bookmarks: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Note' }]
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
