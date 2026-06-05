import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import { mockUsers } from '../config/mockDb.js';
const generateTokens = (id, role) => {
    const accessToken = jwt.sign({ id, role }, process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production_12345', { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret_key_12345', { expiresIn: '30d' });
    return { accessToken, refreshToken };
};
export const register = async (req, res) => {
    // Extracted JECRC specific details from request body
    const { name, email, password, rollNumber, branch, semester, campusBlock } = req.body;
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
                password, // stored plain text for simplicity in mock
                role: 'user',
                avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name.replace(/\s+/g, '')}`,
                bookmarks: [],
                isVerified: true,
                isActive: true,
                rollNumber: rollNumber || '',
                branch: branch || '',
                semester: semester ? parseInt(semester) : 1,
                campusBlock: campusBlock || '',
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
                        bookmarks: newMockUser.bookmarks,
                        rollNumber: newMockUser.rollNumber,
                        branch: newMockUser.branch,
                        semester: newMockUser.semester,
                        campusBlock: newMockUser.campusBlock
                    }
                }
            });
        }
        else {
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
                bookmarks: [],
                rollNumber: rollNumber || '',
                branch: branch || '',
                semester: semester ? parseInt(semester) : 1,
                campusBlock: campusBlock || ''
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
                        bookmarks: newUser.bookmarks,
                        rollNumber: newUser.rollNumber,
                        branch: newUser.branch,
                        semester: newUser.semester,
                        campusBlock: newUser.campusBlock
                    }
                }
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
};
export const login = async (req, res) => {
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
                        bookmarks: user.bookmarks,
                        rollNumber: user.rollNumber || '',
                        branch: user.branch || '',
                        semester: user.semester || 1,
                        campusBlock: user.campusBlock || ''
                    }
                }
            });
        }
        else {
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
                        bookmarks: user.bookmarks,
                        rollNumber: user.rollNumber || '',
                        branch: user.branch || '',
                        semester: user.semester || 1,
                        campusBlock: user.campusBlock || ''
                    }
                }
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Login failed' });
    }
};
export const getProfile = async (req, res) => {
    res.json({
        message: 'Profile retrieved successfully',
        data: {
            user: req.user
        }
    });
};
export const updateProfile = async (req, res) => {
    // Extract new JECRC academic fields in profile settings update
    const { name, avatar, rollNumber, branch, semester, campusBlock } = req.body;
    const userId = req.user?._id;
    try {
        if (global.isMockDatabase) {
            const idx = mockUsers.findIndex(u => u._id === userId);
            if (idx === -1) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            if (name)
                mockUsers[idx].name = name;
            if (avatar)
                mockUsers[idx].avatar = avatar;
            
            // Save settings updates to in-memory user
            if (rollNumber !== undefined) mockUsers[idx].rollNumber = rollNumber;
            if (branch !== undefined) mockUsers[idx].branch = branch;
            if (semester !== undefined) mockUsers[idx].semester = semester ? parseInt(semester) : 1;
            if (campusBlock !== undefined) mockUsers[idx].campusBlock = campusBlock;

            res.json({
                message: 'Profile updated successfully',
                data: {
                    user: {
                        _id: mockUsers[idx]._id,
                        name: mockUsers[idx].name,
                        email: mockUsers[idx].email,
                        role: mockUsers[idx].role,
                        avatar: mockUsers[idx].avatar,
                        bookmarks: mockUsers[idx].bookmarks,
                        rollNumber: mockUsers[idx].rollNumber,
                        branch: mockUsers[idx].branch,
                        semester: mockUsers[idx].semester,
                        campusBlock: mockUsers[idx].campusBlock
                    }
                }
            });
        }
        else {
            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            if (name)
                user.name = name;
            if (avatar)
                user.avatar = avatar;

            // Save settings updates to Mongoose document
            if (rollNumber !== undefined) user.rollNumber = rollNumber;
            if (branch !== undefined) user.branch = branch;
            if (semester !== undefined) user.semester = semester ? parseInt(semester) : 1;
            if (campusBlock !== undefined) user.campusBlock = campusBlock;

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
                        bookmarks: user.bookmarks,
                        rollNumber: user.rollNumber,
                        branch: user.branch,
                        semester: user.semester,
                        campusBlock: user.campusBlock
                    }
                }
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update profile' });
    }
};
export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret_key_12345');
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
        }
        else {
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
    }
    catch (err) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};
