import { Router } from 'express';
import { getSuggestions, createSuggestionHandler } from '../controllers/suggestions.controller.js';

const router = Router();

router.get('/', getSuggestions);
router.post('/', createSuggestionHandler);

export default router;