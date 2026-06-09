import { body, param, query } from 'express-validator';

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
];

export const noteValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Note title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isIn(['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Civil Engineering', 'Electronics Engineering', 'Mechanical Engineering', 'Electrical Engineering'])
    .withMessage('Please select a valid subject area')
];

export const pyqValidation = [
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2000, max: 2026 })
    .withMessage('Please input a valid year between 2000 and 2026'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('university')
    .trim()
    .notEmpty()
    .withMessage('University is required')
    .isIn(['RTU (Rajasthan Technical University)', 'VTU', 'Mumbai University', 'Pune University', 'AKTU', 'Delhi University', 'Anna University', 'IP University', 'Other University'])
    .withMessage('Invalid university option'),
  body('difficultyLevel')
    .trim()
    .notEmpty()
    .withMessage('Difficulty Level is required')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard')
];

export const reviewValidation = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

export const searchValidation = [
  query('q')
    .optional()
    .trim()
];

export const idValidation = [
  param('id')
    .custom((value) => {
      // Validate Mongo ID if NOT in mock mode
      if (!global.isMockDatabase) {
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid database record ID format');
        }
      }
      return true;
    })
];
