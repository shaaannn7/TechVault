import Note from '../models/Note.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { mockNotes, mockUsers } from '../config/mockDb.js';
export const getNotes = async (req, res) => {
    const subject = req.query.subject;
    const search = req.query.search;
    
    // Extracted semester filter stage (1 to 8) from frontend query parameters
    const semester = req.query.semester;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    try {
        if (global.isMockDatabase) {
            // Mock db list filtering (only published ones)
            let list = mockNotes.filter(n => n.isPublished);
            if (subject && subject !== 'All') {
                list = list.filter(n => n.subject === subject);
            }
            
            // Apply semester criteria filter to local mock items
            if (semester && semester !== 'All') {
                list = list.filter(n => n.semester && n.semester.toString() === semester);
            }
            
            if (search) {
                const query = search.toLowerCase();
                list = list.filter(n => n.title.toLowerCase().includes(query) ||
                    n.description.toLowerCase().includes(query) ||
                    n.tags.some(t => t.toLowerCase().includes(query)));
            }
            const total = list.length;
            const paginatedList = list.slice(skip, skip + limit);
            res.json({
                message: 'Notes retrieved successfully',
                data: { notes: paginatedList },
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        else {
            // Mongoose DB filtering
            const query = { isPublished: true };
            if (subject && subject !== 'All') {
                query.subject = subject;
            }
            
            // Apply semester criteria filter to MongoDB queries
            if (semester && semester !== 'All') {
                query.semester = parseInt(semester);
            }
            
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search, 'i')] } }
                ];
            }
            const total = await Note.countDocuments(query);
            const notesList = await Note.find(query)
                .populate('uploadedBy', 'name email avatar rollNumber branch semester campusBlock')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            res.json({
                message: 'Notes retrieved successfully',
                data: { notes: notesList },
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to retrieve notes' });
    }
};
export const getNoteById = async (req, res) => {
    const { id } = req.params;
    try {
        if (global.isMockDatabase) {
            const note = mockNotes.find(n => n._id === id);
            if (!note) {
                res.status(404).json({ message: 'Note not found' });
                return;
            }
            // Increment download/view count
            note.downloads += 1;
            res.json({
                message: 'Note retrieved successfully',
                data: { note }
            });
        }
        else {
            const note = await Note.findById(id).populate('uploadedBy', 'name email avatar rollNumber branch semester campusBlock');
            if (!note) {
                res.status(404).json({ message: 'Note not found' });
                return;
            }
            // Increment download/view count
            note.downloads += 1;
            await note.save();
            // Populate reviews
            const populatedReviews = await Review.find({ noteId: id }).populate('userId', 'name avatar branch semester campusBlock');
            // Convert mongoose note to object and add populated reviews
            const noteObj = note.toObject();
            noteObj.reviews = populatedReviews;
            res.json({
                message: 'Note retrieved successfully',
                data: { note: noteObj }
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to retrieve note details' });
    }
};
export const uploadNote = async (req, res) => {
    const { title, description, subject, tags, fileName, fileUrl, semester, syllabusCode, campusBlock } = req.body;
    const userId = req.user?._id;
    try {
        const isAutoPublish = req.user?.role === 'admin' || req.user?.role === 'moderator';
        const tagArray = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
        if (global.isMockDatabase) {
            const newMockNote = {
                _id: `note-id-${Date.now()}`,
                title,
                description,
                subject,
                fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                fileName: fileName || 'uploaded_document.pdf',
                uploadedBy: {
                    _id: userId,
                    name: req.user?.name || 'User',
                    email: req.user?.email || '',
                    branch: req.user?.branch || '',
                    semester: req.user?.semester || 1,
                    campusBlock: req.user?.campusBlock || ''
                },
                fileSize: Math.floor(Math.random() * 5000000) + 1000000,
                downloads: 0,
                rating: 0,
                reviews: [],
                tags: tagArray,
                isPublished: isAutoPublish,
                isDraft: false,
                semester: semester ? parseInt(semester) : 1,
                syllabusCode: syllabusCode || '',
                campusBlock: campusBlock || '',
                upvotes: 0,
                isVerifiedCreator: req.user?.role === 'admin' || req.user?.role === 'moderator',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            mockNotes.push(newMockNote);
            res.status(201).json({
                message: isAutoPublish ? 'Note published successfully' : 'Note uploaded successfully, awaiting moderation',
                data: { note: newMockNote }
            });
        }
        else {
            const newNote = await Note.create({
                title,
                description,
                subject,
                fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                fileName: fileName || 'uploaded_document.pdf',
                uploadedBy: userId,
                fileSize: Math.floor(Math.random() * 5000000) + 1000000,
                tags: tagArray,
                isPublished: isAutoPublish,
                isDraft: false,
                semester: semester ? parseInt(semester) : 1,
                syllabusCode: syllabusCode || '',
                campusBlock: campusBlock || '',
                upvotes: 0,
                isVerifiedCreator: req.user?.role === 'admin' || req.user?.role === 'moderator'
            });
            res.status(201).json({
                message: isAutoPublish ? 'Note published successfully' : 'Note uploaded successfully, awaiting moderation',
                data: { note: newNote }
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to upload note' });
    }
};
export const updateNote = async (req, res) => {
    const { id } = req.params;
    const { title, description, subject, tags } = req.body;
    const userId = req.user?._id;
    try {
        const tagArray = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined;
        if (global.isMockDatabase) {
            const note = mockNotes.find(n => n._id === id);
            if (!note) {
                res.status(404).json({ message: 'Note not found' });
                return;
            }
            if (note.uploadedBy._id !== userId && req.user?.role !== 'admin') {
                res.status(403).json({ message: 'Not authorized to edit this note' });
                return;
            }
            if (title)
                note.title = title;
            if (description)
                note.description = description;
            if (subject)
                note.subject = subject;
            if (tagArray)
                note.tags = tagArray;
            note.updatedAt = new Date().toISOString();
            res.json({
                message: 'Note updated successfully',
                data: { note }
            });
        }
        else {
            const note = await Note.findById(id);
            if (!note) {
                res.status(404).json({ message: 'Note not found' });
                return;
            }
            if (note.uploadedBy.toString() !== userId && req.user?.role !== 'admin') {
                res.status(403).json({ message: 'Not authorized to edit this note' });
                return;
            }
            if (title)
                note.title = title;
            if (description)
                note.description = description;
            if (subject)
                note.subject = subject;
            if (tagArray)
                note.tags = tagArray;
            await note.save();
            res.json({
                message: 'Note updated successfully',
                data: { note }
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update note' });
    }
};
export const deleteNote = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id;
    try {
        if (global.isMockDatabase) {
            const idx = mockNotes.findIndex(n => n._id === id);
            if (idx === -1) {
                res.status(404).json({ message: 'Note not found' });
                return;
            }
            const note = mockNotes[idx];
            if (note.uploadedBy._id !== userId && req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
                res.status(403).json({ message: 'Not authorized to delete this note' });
                return;
            }
            mockNotes.splice(idx, 1);
            // Clean bookmarks
            mockUsers.forEach(u => {
                u.bookmarks = u.bookmarks.filter(bId => bId !== id);
            });
            res.json({ message: 'Note deleted successfully' });
        }
        else {
            const note = await Note.findById(id);
            if (!note) {
                res.status(404).json({ message: 'Note not found' });
                return;
            }
            if (note.uploadedBy.toString() !== userId && req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
                res.status(403).json({ message: 'Not authorized to delete this note' });
                return;
            }
            await Note.findByIdAndDelete(id);
            // Delete associated reviews
            await Review.deleteMany({ noteId: id });
            // Pull from user bookmarks
            await User.updateMany({ bookmarks: id }, { $pull: { bookmarks: id } });
            res.json({ message: 'Note deleted successfully' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete note' });
    }
};
export const toggleBookmark = async (req, res) => {
    const { id } = req.params; // Note ID
    const userId = req.user?._id;
    try {
        if (global.isMockDatabase) {
            const user = mockUsers.find(u => u._id === userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            const isBookmarked = user.bookmarks.includes(id);
            if (isBookmarked) {
                user.bookmarks = user.bookmarks.filter(bId => bId !== id);
            }
            else {
                user.bookmarks.push(id);
            }
            res.json({
                message: isBookmarked ? 'Bookmark removed' : 'Bookmark added',
                data: { bookmarks: user.bookmarks }
            });
        }
        else {
            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            const isBookmarked = user.bookmarks.includes(id);
            if (isBookmarked) {
                await User.findByIdAndUpdate(userId, { $pull: { bookmarks: id } });
            }
            else {
                await User.findByIdAndUpdate(userId, { $addToSet: { bookmarks: id } });
            }
            const updatedUser = await User.findById(userId);
            res.json({
                message: isBookmarked ? 'Bookmark removed' : 'Bookmark added',
                data: { bookmarks: updatedUser.bookmarks }
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to toggle bookmark' });
    }
};
export const createReview = async (req, res) => {
    const { id } = req.params; // Note ID
    const { rating, comment } = req.body;
    const userId = req.user?._id;
    try {
        if (global.isMockDatabase) {
            const note = mockNotes.find(n => n._id === id);
            if (!note) {
                res.status(404).json({ message: 'Note not found' });
                return;
            }
            const newMockReview = {
                _id: `rev-id-${Date.now()}`,
                rating,
                comment,
                author: req.user?.name || 'User',
                userId: userId,
                noteId: id,
                createdAt: new Date().toISOString()
            };
            note.reviews.push(newMockReview);
            // Re-calculate average rating
            const sum = note.reviews.reduce((acc, r) => acc + r.rating, 0);
            note.rating = parseFloat((sum / note.reviews.length).toFixed(1));
            res.status(201).json({
                message: 'Review submitted successfully',
                data: { review: newMockReview, rating: note.rating }
            });
        }
        else {
            const note = await Note.findById(id);
            if (!note) {
                res.status(404).json({ message: 'Note not found' });
                return;
            }
            const newReview = await Review.create({
                rating,
                comment,
                author: req.user?.name || 'User',
                userId,
                noteId: id
            });
            // Update reviews list on Note
            await Note.findByIdAndUpdate(id, { $push: { reviews: newReview._id } });
            // Re-calculate average rating
            const reviews = await Review.find({ noteId: id });
            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
            const avg = parseFloat((sum / reviews.length).toFixed(1));
            note.rating = avg;
            await note.save();
            res.status(201).json({
                message: 'Review submitted successfully',
                data: { review: newReview, rating: avg }
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to submit review' });
    }
};
export const getUserBookmarks = async (req, res) => {
    const userId = req.user?._id;
    try {
        if (global.isMockDatabase) {
            const user = mockUsers.find(u => u._id === userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            const list = mockNotes.filter(n => user.bookmarks.includes(n._id));
            res.json({
                message: 'Bookmarks retrieved successfully',
                data: { bookmarks: list }
            });
        }
        else {
            const user = await User.findById(userId).populate({
                path: 'bookmarks',
                populate: { path: 'uploadedBy', select: 'name email avatar' }
            });
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.json({
                message: 'Bookmarks retrieved successfully',
                data: { bookmarks: user.bookmarks }
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to retrieve bookmarks' });
    }
};
