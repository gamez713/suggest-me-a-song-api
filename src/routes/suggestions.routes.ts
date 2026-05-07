import { Router } from 'express';
import { getSuggestions } from '../controllers/suggestions.controller.js';

const router = Router();

router.get('/', getSuggestions);

export default router;