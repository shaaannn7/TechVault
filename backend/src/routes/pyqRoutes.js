import { Router } from 'express';
import { getPYQs, uploadPYQ, deletePYQ, getStatistics, trackPYQDownload } from '../controllers/pyqController.js';
import { protect } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validation.js';
import { pyqValidation, idValidation } from '../validators/index.js';
const router = Router();
router.get('/', protect, getPYQs);
router.get('/statistics', protect, getStatistics); // Must be before /:id to prevent hijacking
router.post('/', protect, pyqValidation, validateRequest, uploadPYQ);
router.delete('/:id', protect, idValidation, validateRequest, deletePYQ);
router.post('/:id/download', idValidation, validateRequest, trackPYQDownload);
export default router;
