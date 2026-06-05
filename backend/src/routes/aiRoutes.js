import { Router } from 'express';
import { getAIAssistance } from '../controllers/aiController.js';
import { protect } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validation.js';
import { idValidation } from '../validators/index.js';
const router = Router();
// Protect all AI assistant calls
router.post('/:id', protect, idValidation, validateRequest, getAIAssistance);
export default router;
