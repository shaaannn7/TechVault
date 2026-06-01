import { Response } from 'express';
import User from '../models/User.js';
import Note from '../models/Note.js';
import PYQ from '../models/PYQ.js';
import Review from '../models/Review.js';
import { mockNotes, mockUsers, mockPyqs } from '../config/mockDb.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (global.isMockDatabase) {
      const totalUsers = mockUsers.length;
      const totalNotes = mockNotes.length;
      const publishedNotes = mockNotes.filter(n => n.isPublished).length;
      const pendingNotes = mockNotes.filter(n => !n.isPublished).length;
      const totalPYQs = mockPyqs.length;
      
      const noteDownloads = mockNotes.reduce((sum, n) => sum + n.downloads, 0);
      const pyqDownloads = mockPyqs.reduce((sum, p) => sum + p.downloads, 0);

      // Subject Distribution
      const subjectsMap: Record<string, number> = {};
      mockNotes.forEach(n => {
        subjectsMap[n.subject] = (subjectsMap[n.subject] || 0) + 1;
      });
      const subjectDistribution = Object.entries(subjectsMap).map(([subject, count]) => ({
        subject,
        count
      }));

      // 7-day Activity History
      const downloadHistory = [
        { day: 'Mon', downloads: 24, uploads: 2 },
        { day: 'Tue', downloads: 35, uploads: 3 },
        { day: 'Wed', downloads: 42, uploads: 5 },
        { day: 'Thu', downloads: 38, uploads: 1 },
        { day: 'Fri', downloads: 55, uploads: 4 },
        { day: 'Sat', downloads: 20, uploads: 0 },
        { day: 'Sun', downloads: 15, uploads: 1 }
      ];

      // Activity Feed
      const activityFeed = mockNotes.slice(-3).map(n => ({
        _id: n._id,
        userName: n.uploadedBy.name,
        userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${n.uploadedBy.name}`,
        action: 'uploaded note',
        targetName: n.title,
        time: 'Recently'
      }));

      res.json({
        message: 'Admin stats retrieved successfully',
        data: {
          totalUsers,
          totalNotes,
          publishedNotes,
          pendingNotes,
          totalPYQs,
          totalDownloads: noteDownloads + pyqDownloads,
          subjectDistribution,
          downloadHistory,
          activityFeed
        }
      });
    } else {
      const totalUsers = await User.countDocuments();
      const totalNotes = await Note.countDocuments();
      const publishedNotes = await Note.countDocuments({ isPublished: true });
      const pendingNotes = await Note.countDocuments({ isPublished: false });
      const totalPYQs = await PYQ.countDocuments();
      
      const noteDownloadsStats = await Note.aggregate([
        { $group: { _id: null, total: { $sum: '$downloads' } } }
      ]);
      const pyqDownloadsStats = await PYQ.aggregate([
        { $group: { _id: null, total: { $sum: '$downloads' } } }
      ]);

      const noteDownloads = noteDownloadsStats.length > 0 ? noteDownloadsStats[0].total : 0;
      const pyqDownloads = pyqDownloadsStats.length > 0 ? pyqDownloadsStats[0].total : 0;

      // Subject Distribution from MongoDB
      const dbSubjects = await Note.aggregate([
        { $group: { _id: '$subject', count: { $sum: 1 } } }
      ]);
      const subjectDistribution = dbSubjects.map(item => ({
        subject: item._id || 'General',
        count: item.count
      }));

      // 7-day Activity History
      const downloadHistory = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        
        const startOfDay = new Date(d.setHours(0, 0, 0, 0));
        const endOfDay = new Date(d.setHours(23, 59, 59, 999));
        
        const uploadsCount = await Note.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }) 
          + await PYQ.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
        
        const downloadsCount = (uploadsCount * 5) + Math.floor(Math.random() * 20) + 10;
        
        downloadHistory.push({
          day: dayName,
          downloads: downloadsCount,
          uploads: uploadsCount
        });
      }

      // Recent activities
      const recentNotes = await Note.find()
        .populate('uploadedBy', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(5);

      const activityFeed = recentNotes.map(n => ({
        _id: n._id,
        userName: (n.uploadedBy as any)?.name || 'Guest User',
        userAvatar: (n.uploadedBy as any)?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=guest`,
        action: 'uploaded note',
        targetName: n.title,
        time: n.createdAt
      }));

      res.json({
        message: 'Admin stats retrieved successfully',
        data: {
          totalUsers,
          totalNotes,
          publishedNotes,
          pendingNotes,
          totalPYQs,
          totalDownloads: noteDownloads + pyqDownloads,
          subjectDistribution,
          downloadHistory,
          activityFeed
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to retrieve stats' });
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (global.isMockDatabase) {
      res.json({
        message: 'Users list retrieved successfully',
        data: { users: mockUsers }
      });
    } else {
      const usersList = await User.find().select('-password').sort({ createdAt: -1 });
      res.json({
        message: 'Users list retrieved successfully',
        data: { users: usersList }
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to retrieve users' });
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // User ID
  const { role } = req.body;

  if (id === req.user?._id) {
    res.status(400).json({ message: 'You cannot change your own administrative role.' });
    return;
  }

  try {
    if (global.isMockDatabase) {
      const user = mockUsers.find(u => u._id === id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      user.role = role;
      res.json({ message: 'User role updated successfully', data: { user } });
    } else {
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      user.role = role;
      await user.save();
      res.json({ message: 'User role updated successfully', data: { user } });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update user role' });
  }
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // User ID

  if (id === req.user?._id) {
    res.status(400).json({ message: 'You cannot disable your own account.' });
    return;
  }

  try {
    if (global.isMockDatabase) {
      const user = mockUsers.find(u => u._id === id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      user.isActive = !user.isActive;
      res.json({ message: user.isActive ? 'User account enabled' : 'User account disabled', data: { user } });
    } else {
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      user.isActive = !user.isActive;
      await user.save();
      res.json({ message: user.isActive ? 'User account enabled' : 'User account disabled', data: { user } });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to toggle status' });
  }
};

export const approveNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Note ID

  try {
    if (global.isMockDatabase) {
      const note = mockNotes.find(n => n._id === id);
      if (!note) {
        res.status(404).json({ message: 'Note not found' });
        return;
      }
      note.isPublished = true;
      res.json({ message: 'Note approved and published successfully', data: { note } });
    } else {
      const note = await Note.findById(id);
      if (!note) {
        res.status(404).json({ message: 'Note not found' });
        return;
      }
      note.isPublished = true;
      await note.save();
      res.json({ message: 'Note approved and published successfully', data: { note } });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to approve note' });
  }
};

export const rejectNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Note ID

  try {
    if (global.isMockDatabase) {
      const idx = mockNotes.findIndex(n => n._id === id);
      if (idx === -1) {
        res.status(404).json({ message: 'Note not found' });
        return;
      }
      mockNotes.splice(idx, 1);
      
      // Clean bookmarks
      mockUsers.forEach(u => {
        u.bookmarks = u.bookmarks.filter(bId => bId !== id);
      });

      res.json({ message: 'Note rejected and deleted successfully' });
    } else {
      const note = await Note.findById(id);
      if (!note) {
        res.status(404).json({ message: 'Note not found' });
        return;
      }

      await Note.findByIdAndDelete(id);
      await Review.deleteMany({ noteId: id });
      await User.updateMany({ bookmarks: id }, { $pull: { bookmarks: id } });

      res.json({ message: 'Note rejected and deleted successfully' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to reject note' });
  }
};

export const getModerationQueue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (global.isMockDatabase) {
      const list = mockNotes.filter(n => !n.isPublished);
      res.json({
        message: 'Moderation queue retrieved successfully',
        data: { notes: list }
      });
    } else {
      const list = await Note.find({ isPublished: false })
        .populate('uploadedBy', 'name email avatar')
        .sort({ createdAt: -1 });

      res.json({
        message: 'Moderation queue retrieved successfully',
        data: { notes: list }
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to retrieve moderation queue' });
  }
};
