import { Router } from 'express';
import { getDashboardStats, getUsers, updateUserRole, toggleUserStatus, approveNote, rejectNote, getModerationQueue } from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validation.js';
import { idValidation } from '../validators/index.js';
const router = Router();
// Protect all admin routes
router.use(protect);
router.get('/dashboard', authorizeRoles('admin', 'moderator'), getDashboardStats);
router.get('/moderation-queue', authorizeRoles('admin', 'moderator'), getModerationQueue);
router.post('/notes/:id/approve', authorizeRoles('admin', 'moderator'), idValidation, validateRequest, approveNote);
router.post('/notes/:id/reject', authorizeRoles('admin', 'moderator'), idValidation, validateRequest, rejectNote);
// User Management (Admin only)
router.get('/users', authorizeRoles('admin'), getUsers);
router.put('/users/:id/role', authorizeRoles('admin'), idValidation, validateRequest, updateUserRole);
router.put('/users/:id/disable', authorizeRoles('admin'), idValidation, validateRequest, toggleUserStatus);
export default router;
