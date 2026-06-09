import mongoose, { Schema } from 'mongoose';

// UserSchema defines how student profile details are stored in the database.
// Modified to include specific JECRC academic identity fields for authenticity.
const UserSchema = new Schema({
    // Full Name of the student or moderator
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    
    // Official college email (e.g. name@jecrc.ac.in)
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    
    // Encrypted password hash
    password: { type: String, required: true, minlength: 6 },
    
    // Profile avatar icon path or URL
    avatar: { type: String, default: '' },
    
    // Role permissions control: normal 'user', moderator, or master admin
    role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
    
    // Verification flag (e.g. matched against JECRC Student Roll List)
    isVerified: { type: Boolean, default: true },
    
    // Account status check (active or deactivated by admin)
    isActive: { type: Boolean, default: true },
    
    // List of bookmarked notes saved by this user
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Note' }],

    // JECRC-Specific Student Identifiers:
    // Student College Roll Number (e.g., 23EJCAC054)
    rollNumber: { type: String, default: '' },
    
    // Department Branch (e.g. CSE, IT, ECE, Mechanical)
    branch: { type: String, default: '' },
    
    // Current Semester (1st to 8th Semester)
    semester: { type: Number, default: 1 },
    
    // Typical Classroom Block (e.g. A-Block, C-Block, JECRC Main)
    campusBlock: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
