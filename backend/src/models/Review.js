import mongoose, { Schema } from 'mongoose';
const ReviewSchema = new Schema({
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
    author: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true }
}, { timestamps: true });
// Index on noteId for quick loading of reviews on Note details page
ReviewSchema.index({ noteId: 1 });
export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
