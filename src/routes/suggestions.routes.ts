import { Router } from 'express';
import {
    createSuggestionHandler,
    getSuggestionsHandler, getSuggestionbyIdHandler,
    updateSuggestionStatusHandler,
    deleteSuggestionHandler
} from '../controllers/suggestions.controller.js';

const router = Router();

router.post('/', createSuggestionHandler);
router.get('/', getSuggestionsHandler);
router.get('/:id', getSuggestionbyIdHandler);
router.patch('/:id', updateSuggestionStatusHandler);
router.delete('/:id', deleteSuggestionHandler);

export default router;