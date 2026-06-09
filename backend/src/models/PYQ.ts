import mongoose, { Schema, Document } from 'mongoose';

export interface IPYQ extends Document {
  year: number;
  subject: string;
  fileUrl: string;
  fileName: string;
  university: string;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  uploadedBy: mongoose.Types.ObjectId;
  downloads: number;
  isFree: boolean;
  semester: number;
  syllabusCode: string;
  campusBlock: string;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const PYQSchema: Schema = new Schema(
  {
    year: { type: Number, required: true, min: 2000 },
    subject: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    university: { 
      type: String, 
      required: true,
      enum: ['RTU (Rajasthan Technical University)', 'VTU', 'Mumbai University', 'Pune University', 'AKTU', 'Delhi University', 'Anna University', 'IP University', 'Other University']
    },
    difficultyLevel: { 
      type: String, 
      required: true,
      enum: ['Easy', 'Medium', 'Hard']
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    downloads: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
    semester: { type: Number, default: 1 },
    syllabusCode: { type: String, default: '' },
    campusBlock: { type: String, default: '' },
    upvotes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Indexes for fast searching
PYQSchema.index({ year: 1, subject: 1, university: 1 });
PYQSchema.index({ uploadedBy: 1 });
PYQSchema.index({ semester: 1 });

export default mongoose.models.PYQ || mongoose.model<IPYQ>('PYQ', PYQSchema);
