import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import { mockUsers } from '../config/mockDb.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

const generateTokens = (id: string, role: string) => {
  const accessToken = jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production_12345',
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { id },
    process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret_key_12345',
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    if (global.isMockDatabase) {
      // Mock db implementation
      const exists = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        res.status(400).json({ message: 'Email address already registered.' });
        return;
      }

      const newMockUser = {
        _id: `user-id-${Date.now()}`,
        name,
        email,
        password, // stored plain text for simplicity in mock, or we can hash
        role: 'user' as const,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name.replace(/\s+/g, '')}`,
        bookmarks: [],
        isVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockUsers.push(newMockUser);

      const { accessToken, refreshToken } = generateTokens(newMockUser._id, newMockUser.role);
      
      res.status(201).json({
        message: 'Account registered successfully',
        data: {
          accessToken,
          refreshToken,
          user: {
            _id: newMockUser._id,
            name: newMockUser.name,
            email: newMockUser.email,
            role: newMockUser.role,
            avatar: newMockUser.avatar,
            bookmarks: newMockUser.bookmarks
          }
        }
      });
    } else {
      // Mongoose DB implementation
      const exists = await User.findOne({ email });
      if (exists) {
        res.status(400).json({ message: 'Email address already registered.' });
        return;
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name.replace(/\s+/g, '')}`,
        role: 'user',
        bookmarks: []
      });

      const { accessToken, refreshToken } = generateTokens(newUser._id.toString(), newUser.role);

      res.status(201).json({
        message: 'Account registered successfully',
        data: {
          accessToken,
          refreshToken,
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            avatar: newUser.avatar,
            bookmarks: newUser.bookmarks
          }
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (global.isMockDatabase) {
      // Mock db login
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        res.status(400).json({ message: 'Invalid email or password.' });
        return;
      }

      if (user.password !== password) {
        res.status(400).json({ message: 'Invalid email or password.' });
        return;
      }

      if (!user.isActive) {
        res.status(400).json({ message: 'Your account has been deactivated.' });
        return;
      }

      const { accessToken, refreshToken } = generateTokens(user._id, user.role);

      res.json({
        message: 'Logged in successfully',
        data: {
          accessToken,
          refreshToken,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bookmarks: user.bookmarks
          }
        }
      });
    } else {
      // Mongoose DB login
      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ message: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ message: 'Invalid email or password.' });
        return;
      }

      if (!user.isActive) {
        res.status(400).json({ message: 'Your account has been deactivated.' });
        return;
      }

      const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

      res.json({
        message: 'Logged in successfully',
        data: {
          accessToken,
          refreshToken,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bookmarks: user.bookmarks
          }
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    }
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, avatar } = req.body;
  const userId = req.user?._id;

  try {
    if (global.isMockDatabase) {
      const idx = mockUsers.findIndex(u => u._id === userId);
      if (idx === -1) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      if (name) mockUsers[idx].name = name;
      if (avatar) mockUsers[idx].avatar = avatar;

      res.json({
        message: 'Profile updated successfully',
        data: {
          user: {
            _id: mockUsers[idx]._id,
            name: mockUsers[idx].name,
            email: mockUsers[idx].email,
            role: mockUsers[idx].role,
            avatar: mockUsers[idx].avatar,
            bookmarks: mockUsers[idx].bookmarks
          }
        }
      });
    } else {
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bookmarks: user.bookmarks
          }
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: 'Refresh token is required' });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret_key_12345') as { id: string };

    if (global.isMockDatabase) {
      const user = mockUsers.find(u => u._id === decoded.id);
      if (!user) {
        res.status(401).json({ message: 'Invalid refresh token user' });
        return;
      }
      const tokens = generateTokens(user._id, user.role);
      res.json({
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      });
    } else {
      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(401).json({ message: 'Invalid refresh token user' });
        return;
      }
      const tokens = generateTokens(user._id.toString(), user.role);
      res.json({
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      });
    }
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};
