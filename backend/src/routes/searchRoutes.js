import { Router } from 'express';
import { globalSearch, getSuggestions } from '../controllers/searchController.js';
import { validateRequest } from '../middlewares/validation.js';
import { searchValidation } from '../validators/index.js';
const router = Router();
router.get('/search', searchValidation, validateRequest, globalSearch);
router.get('/suggestions', getSuggestions);
export default router;
