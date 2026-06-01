import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  title: string;
  description: string;
  subject: string;
  fileUrl: string;
  fileName: string;
  uploadedBy: mongoose.Types.ObjectId;
  fileSize: number;
  downloads: number;
  rating: number;
  reviews: mongoose.Types.ObjectId[];
  tags: string[];
  isPublished: boolean;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    subject: { 
      type: String, 
      required: true,
      enum: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Civil Engineering', 'Electronics Engineering', 'Mechanical Engineering', 'Electrical Engineering']
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileSize: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    tags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Search Indexes
NoteSchema.index({ title: 'text', description: 'text' });
NoteSchema.index({ subject: 1, isPublished: 1 });
NoteSchema.index({ uploadedBy: 1 });

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
