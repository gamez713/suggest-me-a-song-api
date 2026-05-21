import { Router } from 'express';
import { createSuggestionHandler, getSuggestionsHandler, getSuggestionbyIdHandler, updateSuggestionStatusHandler} from '../controllers/suggestions.controller.js';

const router = Router();

router.post('/', createSuggestionHandler);
router.get('/', getSuggestionsHandler);
router.get('/:id', getSuggestionbyIdHandler);
router.patch('/:id', updateSuggestionStatusHandler);

export default router;