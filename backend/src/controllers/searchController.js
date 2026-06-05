import Note from '../models/Note.js';
import PYQ from '../models/PYQ.js';
import { mockNotes, mockPyqs } from '../config/mockDb.js';
export const globalSearch = async (req, res) => {
    const query = req.query.q;
    if (!query) {
        res.status(400).json({ message: 'Search term is required' });
        return;
    }
    const searchTerm = query.toLowerCase();
    try {
        if (global.isMockDatabase) {
            // Mock db search
            const matchedNotes = mockNotes.filter(n => n.isPublished && (n.title.toLowerCase().includes(searchTerm) ||
                n.description.toLowerCase().includes(searchTerm) ||
                n.tags.some(t => t.toLowerCase().includes(searchTerm))));
            const matchedPYQs = mockPyqs.filter(p => p.subject.toLowerCase().includes(searchTerm) ||
                p.university.toLowerCase().includes(searchTerm));
            res.json({
                message: 'Search completed successfully',
                data: {
                    notes: matchedNotes,
                    pyqs: matchedPYQs
                }
            });
        }
        else {
            // Mongoose DB search
            const matchedNotes = await Note.find({
                isPublished: true,
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { tags: { $in: [new RegExp(query, 'i')] } }
                ]
            }).populate('uploadedBy', 'name email avatar').limit(10);
            const matchedPYQs = await PYQ.find({
                $or: [
                    { subject: { $regex: query, $options: 'i' } },
                    { university: { $regex: query, $options: 'i' } }
                ]
            }).populate('uploadedBy', 'name email avatar').limit(10);
            res.json({
                message: 'Search completed successfully',
                data: {
                    notes: matchedNotes,
                    pyqs: matchedPYQs
                }
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Search execution failed' });
    }
};
export const getSuggestions = async (req, res) => {
    const query = req.query.q;
    if (!query) {
        res.json({ data: { suggestions: [] } });
        return;
    }
    const term = query.toLowerCase();
    try {
        if (global.isMockDatabase) {
            const notesSuggestions = mockNotes
                .filter(n => n.isPublished && n.title.toLowerCase().includes(term))
                .map(n => n.title);
            const pyqSuggestions = mockPyqs
                .filter(p => p.subject.toLowerCase().includes(term))
                .map(p => `${p.subject} PYQ (${p.university})`);
            const all = [...new Set([...notesSuggestions, ...pyqSuggestions])].slice(0, 8);
            res.json({
                message: 'Suggestions loaded successfully',
                data: { suggestions: all }
            });
        }
        else {
            const matchedNotes = await Note.find({
                isPublished: true,
                title: { $regex: query, $options: 'i' }
            }).limit(5);
            const matchedPYQs = await PYQ.find({
                subject: { $regex: query, $options: 'i' }
            }).limit(5);
            const suggestions = [
                ...matchedNotes.map(n => n.title),
                ...matchedPYQs.map(p => `${p.subject} PYQ (${p.university})`)
            ];
            const uniq = [...new Set(suggestions)].slice(0, 8);
            res.json({
                message: 'Suggestions loaded successfully',
                data: { suggestions: uniq }
            });
        }
    }
    catch (error) {
        res.json({ data: { suggestions: [] } });
    }
};
