import { Router } from 'express';
import { getSuggestions, getSuggestionbyIdHandler, createSuggestionHandler } from '../controllers/suggestions.controller.js';

const router = Router();

router.get('/', getSuggestions);
router.get('/:id', getSuggestionbyIdHandler);
router.post('/', createSuggestionHandler);

export default router;