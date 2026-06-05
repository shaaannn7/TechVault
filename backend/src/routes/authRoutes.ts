import { Router } from 'express';
import { register, login, getProfile, updateProfile, refreshToken } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validation.js';
import { registerValidation, loginValidation } from '../validators/index.js';

const router = Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/refresh-token', refreshToken);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
