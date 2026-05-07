import type { Request, Response } from 'express';
import { getAllSuggestions } from '../services/suggestions.service.js';

export async function getSuggestions(req: Request, res: Response) {
    const suggestions = await getAllSuggestions();

    return res.status(200).json(suggestions);
}