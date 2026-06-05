import mongoose, { Schema } from 'mongoose';

// NoteSchema defines how study notes are stored in the database.
// Added fields for RTU Syllabus matching, semesters, campus blocks, and peer trust ratings.
const NoteSchema = new Schema({
    // The descriptive heading of the lecture note (e.g. Computer Graphics Unit 1)
    title: { type: String, required: true, trim: true, maxlength: 200 },
    
    // Summary of chapters or syllabus topics covered in the PDF
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    
    // The parent branch category
    subject: {
        type: String,
        required: true,
        enum: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Civil Engineering', 'Electronics Engineering', 'Mechanical Engineering', 'Electrical Engineering']
    },
    
    // File path where the PDF is stored locally on the server (e.g., /uploads/filename.pdf)
    fileUrl: { type: String, required: true },
    
    // Original filename uploaded by the student
    fileName: { type: String, required: true },
    
    // Link to the User document who uploaded this file
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    // File size in bytes for metadata display
    fileSize: { type: Number, default: 0 },
    
    // Total count of downloads by other students
    downloads: { type: Number, default: 0 },
    
    // Average peer rating score (e.g. 4.5 based on 5 stars)
    rating: { type: Number, default: 0 },
    
    // Reviews posted on this document by student peers
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    
    // Searchable tag keywords (e.g., matrices, pointer, RTU)
    tags: [{ type: String, trim: true }],
    
    // If true, the note has been approved by a moderator and shows up in search
    isPublished: { type: Boolean, default: false },
    
    // If true, user is still editing this note and hasn't submitted it
    isDraft: { type: Boolean, default: false },

    // --- REFINED ACADEMIC METADATA ---
    // Semester Number (1 to 8) - crucial for sorting/filtering notes by syllabus stage
    semester: { type: Number, default: 1 },

    // RTU (Rajasthan Technical University) Course Code (e.g. 3CS4-05) for instant syllabus trust
    syllabusCode: { type: String, default: '' },

    // JECRC Building Block where lectures occur (e.g., A-Block, C-Block)
    campusBlock: { type: String, default: '' },

    // Total upvotes received from peers who found this note accurate
    upvotes: { type: Number, default: 0 },

    // True if uploaded by an academically outstanding peer or teacher assistant
    isVerifiedCreator: { type: Boolean, default: false }
}, { timestamps: true });

// Search Indexes for fast database searches
NoteSchema.index({ title: 'text', description: 'text' });
NoteSchema.index({ subject: 1, isPublished: 1 });
NoteSchema.index({ uploadedBy: 1 });
NoteSchema.index({ semester: 1 }); // Index for fast semester-wise discovery filtering

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
