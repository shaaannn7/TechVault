import { Response } from 'express';
import PYQ from '../models/PYQ.js';
import { mockPyqs } from '../config/mockDb.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const getPYQs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { university, year, difficultyLevel, search } = req.query;

  try {
    if (global.isMockDatabase) {
      let list = [...mockPyqs];

      if (university && university !== 'All') {
        list = list.filter(p => p.university === university);
      }

      if (year && year !== 'All') {
        list = list.filter(p => p.year.toString() === year);
      }

      if (difficultyLevel && difficultyLevel !== 'All') {
        list = list.filter(p => p.difficultyLevel === difficultyLevel);
      }

      if (search) {
        const query = (search as string).toLowerCase();
        list = list.filter(p => p.subject.toLowerCase().includes(query));
      }

      res.json({
        message: 'Question papers retrieved successfully',
        data: { pyqs: list }
      });
    } else {
      const filter: any = {};

      if (university && university !== 'All') {
        filter.university = university;
      }

      if (year && year !== 'All') {
        filter.year = parseInt(year as string);
      }

      if (difficultyLevel && difficultyLevel !== 'All') {
        filter.difficultyLevel = difficultyLevel;
      }

      if (search) {
        filter.subject = { $regex: search as string, $options: 'i' };
      }

      const list = await PYQ.find(filter)
        .populate('uploadedBy', 'name email avatar')
        .sort({ createdAt: -1 });

      res.json({
        message: 'Question papers retrieved successfully',
        data: { pyqs: list }
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to retrieve papers' });
  }
};

export const uploadPYQ = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { year, subject, university, difficultyLevel, fileName, fileUrl } = req.body;
  const userId = req.user?._id;

  try {
    if (global.isMockDatabase) {
      const newMockPYQ = {
        _id: `pyq-id-${Date.now()}`,
        year: parseInt(year),
        subject,
        university,
        difficultyLevel: difficultyLevel as 'Easy' | 'Medium' | 'Hard',
        downloads: 0,
        isFree: true,
        uploadedBy: {
          _id: userId!,
          name: req.user?.name || 'User',
          email: req.user?.email || ''
        },
        fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: fileName || 'uploaded_pyq.pdf',
        createdAt: new Date().toISOString()
      };

      mockPyqs.push(newMockPYQ);

      res.status(201).json({
        message: 'Question paper uploaded successfully',
        data: { pyq: newMockPYQ }
      });
    } else {
      const newPYQ = await PYQ.create({
        year: parseInt(year),
        subject,
        university,
        difficultyLevel,
        uploadedBy: userId,
        fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: fileName || 'uploaded_pyq.pdf'
      });

      res.status(201).json({
        message: 'Question paper uploaded successfully',
        data: { pyq: newPYQ }
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to upload paper' });
  }
};

export const deletePYQ = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id;

  try {
    if (global.isMockDatabase) {
      const idx = mockPyqs.findIndex(p => p._id === id);
      if (idx === -1) {
        res.status(404).json({ message: 'Paper not found' });
        return;
      }

      if (mockPyqs[idx].uploadedBy._id !== userId && req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
        res.status(403).json({ message: 'Not authorized to delete this paper' });
        return;
      }

      mockPyqs.splice(idx, 1);
      res.json({ message: 'Question paper deleted successfully' });
    } else {
      const paper = await PYQ.findById(id);
      if (!paper) {
        res.status(404).json({ message: 'Paper not found' });
        return;
      }

      if (paper.uploadedBy.toString() !== userId && req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
        res.status(403).json({ message: 'Not authorized to delete this paper' });
        return;
      }

      await PYQ.findByIdAndDelete(id);
      res.json({ message: 'Question paper deleted successfully' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete paper' });
  }
};

export const getStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (global.isMockDatabase) {
      // Mock metrics compilation
      const totalPapers = mockPyqs.length;
      const downloads = mockPyqs.reduce((sum, p) => sum + p.downloads, 0);

      res.json({
        message: 'PYQ statistics compiled successfully',
        data: {
          totalPapers,
          totalDownloads: downloads
        }
      });
    } else {
      const totalPapers = await PYQ.countDocuments();
      const stats = await PYQ.aggregate([
        { $group: { _id: null, totalDownloads: { $sum: '$downloads' } } }
      ]);
      const downloads = stats.length > 0 ? stats[0].totalDownloads : 0;

      res.json({
        message: 'PYQ statistics compiled successfully',
        data: {
          totalPapers,
          totalDownloads: downloads
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to retrieve statistics' });
  }
};

export const trackPYQDownload = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (global.isMockDatabase) {
      const paper = mockPyqs.find(p => p._id === id);
      if (!paper) {
        res.status(404).json({ message: 'Paper not found' });
        return;
      }
      paper.downloads += 1;
      res.json({ message: 'Download tracked successfully', downloads: paper.downloads });
    } else {
      const paper = await PYQ.findById(id);
      if (!paper) {
        res.status(404).json({ message: 'Paper not found' });
        return;
      }
      paper.downloads += 1;
      await paper.save();
      res.json({ message: 'Download tracked successfully', downloads: paper.downloads });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to track download' });
  }
};
