import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { mockUsers } from '../config/mockDb.js';
export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        res.status(401).json({ message: 'Authentication required. No token provided.' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production_12345');
        if (global.isMockDatabase) {
            // Mock db lookup
            const user = mockUsers.find(u => u._id === decoded.id);
            if (!user) {
                res.status(401).json({ message: 'User not found' });
                return;
            }
            if (!user.isActive) {
                res.status(401).json({ message: 'User account has been disabled' });
                return;
            }
            req.user = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bookmarks: user.bookmarks,
                isActive: user.isActive,
                rollNumber: user.rollNumber || '',
                branch: user.branch || '',
                semester: user.semester || 1,
                campusBlock: user.campusBlock || ''
            };
            next();
        }
        else {
            // Mongoose database lookup
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                res.status(401).json({ message: 'User not found' });
                return;
            }
            if (!user.isActive) {
                res.status(401).json({ message: 'User account has been disabled' });
                return;
            }
            req.user = {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                bookmarks: user.bookmarks.map((b) => b.toString()),
                isActive: user.isActive,
                rollNumber: user.rollNumber || '',
                branch: user.branch || '',
                semester: user.semester || 1,
                campusBlock: user.campusBlock || ''
            };
            next();
        }
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }
};
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: `Access denied. Role '${req.user?.role || 'unknown'}' is not authorized.` });
            return;
        }
        next();
    };
};
