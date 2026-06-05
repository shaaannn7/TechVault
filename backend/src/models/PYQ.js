import mongoose, { Schema } from 'mongoose';

// PYQSchema defines how Previous Year Question papers (PYQs) are structured.
// Refined to include JECRC semesters, RTU paper codes, and download counts.
const PYQSchema = new Schema({
    // Academic Year of the exam (e.g. 2024)
    year: { type: Number, required: true, min: 2000 },
    
    // Subject Name of the exam (e.g. Microprocessors)
    subject: { type: String, required: true, trim: true },
    
    // Server file path for downloading/rendering the exam PDF
    fileUrl: { type: String, required: true },
    
    // File name as stored on disk
    fileName: { type: String, required: true },
    
    // The affiliated board or university
    university: {
        type: String,
        required: true,
        enum: ['RTU (Rajasthan Technical University)', 'VTU', 'Mumbai University', 'Pune University', 'AKTU', 'Delhi University', 'Anna University', 'IP University', 'Other University']
    },
    
    // Student difficulty rating (Easy, Medium, Hard)
    difficultyLevel: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard']
    },
    
    // Link to User who contributed this question paper
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Download counter
    downloads: { type: Number, default: 0 },
    
    // Free status flag
    isFree: { type: Boolean, default: true },

    // --- REFINED ACADEMIC METADATA ---
    // Semester Number (1 to 8) - critical for matching exams to current study semester
    semester: { type: Number, default: 1 },

    // RTU Syllabus Course Code (e.g., 3CS4-04)
    syllabusCode: { type: String, default: '' },

    // JECRC Block reference (where this exam paper is mostly taught)
    campusBlock: { type: String, default: '' },

    // Peer votes for validation
    upvotes: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes for fast searching
PYQSchema.index({ year: 1, subject: 1, university: 1 });
PYQSchema.index({ uploadedBy: 1 });
PYQSchema.index({ semester: 1 }); // Index for fast filtering by semesters

export default mongoose.models.PYQ || mongoose.model('PYQ', PYQSchema);
