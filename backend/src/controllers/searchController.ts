import { Response } from 'express';
import Note from '../models/Note.js';
import PYQ from '../models/PYQ.js';
import User from '../models/User.js';
import { mockNotes, mockPyqs, MockNote, MockPYQ } from '../config/mockDb.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

const BRANCH_MAP: Record<string, string> = {
  'CSE': 'Computer Science',
  'ECE': 'Electronics Engineering',
  'EE': 'Electrical Engineering',
  'ME': 'Mechanical Engineering',
  'CE': 'Civil Engineering',
  'MATH': 'Mathematics',
  'PHYS': 'Physics',
  'CHEM': 'Chemistry'
};

export const globalSearch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const q = req.query.q as string;
  const branch = req.query.branch as string;
  const semester = req.query.semester as string;
  const subject = req.query.subject as string;
  const category = req.query.category as string;
  const sortBy = req.query.sortBy as string;
  const page = req.query.page as string;
  const limit = req.query.limit as string;

  const queryStr = q ? q.trim() : '';
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 10);
  const skipNum = (pageNum - 1) * limitNum;

  try {
    if (global.isMockDatabase) {
      let filteredNotes: MockNote[] = [];
      let filteredPyqs: MockPYQ[] = [];

      if (!category || category === 'All' || category === 'Notes') {
        filteredNotes = mockNotes.filter(n => n.isPublished);

        if (queryStr) {
          const searchLower = queryStr.toLowerCase();
          filteredNotes = filteredNotes.filter(n => 
            n.title.toLowerCase().includes(searchLower) ||
            n.description.toLowerCase().includes(searchLower) ||
            (n.syllabusCode && n.syllabusCode.toLowerCase().includes(searchLower)) ||
            n.subject.toLowerCase().includes(searchLower) ||
            n.tags.some(t => t.toLowerCase().includes(searchLower)) ||
            (n.uploadedBy && n.uploadedBy.name.toLowerCase().includes(searchLower))
          );
        }

        if (branch && branch !== 'All' && BRANCH_MAP[branch]) {
          filteredNotes = filteredNotes.filter(n => n.subject === BRANCH_MAP[branch]);
        }

        if (semester && semester !== 'All') {
          filteredNotes = filteredNotes.filter(n => n.semester === parseInt(semester));
        }

        if (subject && subject !== 'All') {
          filteredNotes = filteredNotes.filter(n => n.subject === subject);
        }
      }

      if (!category || category === 'All' || category === 'PYQs') {
        filteredPyqs = [...mockPyqs];

        if (queryStr) {
          const searchLower = queryStr.toLowerCase();
          filteredPyqs = filteredPyqs.filter(p => 
            p.subject.toLowerCase().includes(searchLower) ||
            p.university.toLowerCase().includes(searchLower) ||
            (p.syllabusCode && p.syllabusCode.toLowerCase().includes(searchLower)) ||
            (p.uploadedBy && p.uploadedBy.name && p.uploadedBy.name.toLowerCase().includes(searchLower))
          );
        }

        if (branch && branch !== 'All' && BRANCH_MAP[branch]) {
          const branchSubject = BRANCH_MAP[branch].toLowerCase();
          filteredPyqs = filteredPyqs.filter(p => p.subject.toLowerCase().includes(branchSubject));
        }

        if (semester && semester !== 'All') {
          filteredPyqs = filteredPyqs.filter(p => p.semester === parseInt(semester));
        }

        if (subject && subject !== 'All') {
          const subLower = subject.toLowerCase();
          filteredPyqs = filteredPyqs.filter(p => p.subject.toLowerCase().includes(subLower));
        }
      }

      if (sortBy === 'newest') {
        filteredNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        filteredPyqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'popular') {
        filteredNotes.sort((a, b) => b.downloads - a.downloads);
        filteredPyqs.sort((a, b) => b.downloads - a.downloads);
      } else if (sortBy === 'rating') {
        filteredNotes.sort((a, b) => b.rating - a.rating);
        filteredPyqs.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      } else if (sortBy === 'title') {
        filteredNotes.sort((a, b) => a.title.localeCompare(b.title));
        filteredPyqs.sort((a, b) => a.subject.localeCompare(b.subject));
      } else {
        filteredNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        filteredPyqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const totalNotes = filteredNotes.length;
      const totalPYQs = filteredPyqs.length;

      const paginatedNotes = filteredNotes.slice(skipNum, skipNum + limitNum);
      const paginatedPyqs = filteredPyqs.slice(skipNum, skipNum + limitNum);

      res.json({
        message: 'Mock Search completed successfully',
        data: {
          notes: paginatedNotes,
          pyqs: paginatedPyqs,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalNotes,
            totalPYQs
          }
        }
      });
      return;
    }

    const noteFilter: any = { isPublished: true };
    const pyqFilter: any = {};

    let matchedUserIds: any[] = [];
    if (queryStr) {
      const users = await User.find({ name: { $regex: queryStr, $options: 'i' } }).select('_id');
      matchedUserIds = users.map(u => u._id);
    }

    if (queryStr) {
      noteFilter.$or = [
        { title: { $regex: queryStr, $options: 'i' } },
        { description: { $regex: queryStr, $options: 'i' } },
        { syllabusCode: { $regex: queryStr, $options: 'i' } },
        { subject: { $regex: queryStr, $options: 'i' } },
        { tags: { $in: [new RegExp(queryStr, 'i')] } }
      ];
      if (matchedUserIds.length > 0) {
        noteFilter.$or.push({ uploadedBy: { $in: matchedUserIds } });
      }

      pyqFilter.$or = [
        { subject: { $regex: queryStr, $options: 'i' } },
        { syllabusCode: { $regex: queryStr, $options: 'i' } },
        { university: { $regex: queryStr, $options: 'i' } }
      ];
      if (matchedUserIds.length > 0) {
        pyqFilter.$or.push({ uploadedBy: { $in: matchedUserIds } });
      }
    }

    if (branch && branch !== 'All' && BRANCH_MAP[branch]) {
      const targetSubject = BRANCH_MAP[branch];
      noteFilter.subject = targetSubject;
      pyqFilter.subject = { $regex: targetSubject, $options: 'i' };
    }

    if (semester && semester !== 'All') {
      const semNum = parseInt(semester);
      noteFilter.semester = semNum;
      pyqFilter.semester = semNum;
    }

    if (subject && subject !== 'All') {
      noteFilter.subject = subject;
      pyqFilter.subject = { $regex: subject, $options: 'i' };
    }

    const noteSort: any = {};
    const pyqSort: any = {};
    if (sortBy === 'newest') {
      noteSort.createdAt = -1;
      pyqSort.createdAt = -1;
    } else if (sortBy === 'popular') {
      noteSort.downloads = -1;
      pyqSort.downloads = -1;
    } else if (sortBy === 'rating') {
      noteSort.rating = -1;
      pyqSort.upvotes = -1;
    } else if (sortBy === 'title') {
      noteSort.title = 1;
      pyqSort.subject = 1;
    } else {
      noteSort.createdAt = -1;
      pyqSort.createdAt = -1;
    }

    let dbNotes = [];
    let dbPyqs = [];
    let totalNotes = 0;
    let totalPYQs = 0;

    if (!category || category === 'All' || category === 'Notes') {
      totalNotes = await Note.countDocuments(noteFilter);
      dbNotes = await Note.find(noteFilter)
        .populate('uploadedBy', 'name email avatar isVerified role branch')
        .sort(noteSort)
        .skip(skipNum)
        .limit(limitNum);
    }

    if (!category || category === 'All' || category === 'PYQs') {
      totalPYQs = await PYQ.countDocuments(pyqFilter);
      dbPyqs = await PYQ.find(pyqFilter)
        .populate('uploadedBy', 'name email avatar isVerified role branch')
        .sort(pyqSort)
        .skip(skipNum)
        .limit(limitNum);
    }

    res.json({
      message: 'Search completed successfully',
      data: {
        notes: dbNotes,
        pyqs: dbPyqs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalNotes,
          totalPYQs
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Search execution failed' });
  }
};

export const getSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const query = req.query.q as string;
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
    } else {
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
  } catch (error) {
    res.json({ data: { suggestions: [] } });
  }
};
