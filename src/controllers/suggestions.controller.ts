import type { Request, Response } from 'express';
import { getAllSuggestions, getSuggestionbyId, createSuggestion} from '../services/suggestions.service.js';

export async function getSuggestions(req: Request, res: Response) {
    // Get all suggestions from service
    const suggestions = await getAllSuggestions();

    return res.status(200).json(suggestions);
}

export async function getSuggestionbyIdHandler(req: Request, res: Response) {
    const id = parseInt(req.params.id as string, 10);

    // Validate id
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid id parameter" });
    }

    // Get suggestion by id from service
    const suggestion = await getSuggestionbyId(id);

    if (!suggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
    }

    return res.status(200).json(suggestion);
}

export async function createSuggestionHandler(req: Request, res: Response) {
    const { title, artist, message } = req.body;

    // Validate required fields
    if (!title || !artist) {
         return res.status(400).json({ error: "Title and artist are required" });
    }
    // Validate types
    if (typeof title !== "string" || typeof artist !== "string") {
        return res.status(400).json({ error: "Title and artist must be strings" });
    }
    if (message !== undefined && typeof message !== "string") {
        return res.status(400).json({ error: "Message must be a string" });
    }

    // Trim inputs
    const trimmedTitle = title.trim();
    const trimmedArtist = artist.trim();
    const trimmedMessage = message?.trim();

    // Empty string check
    if (trimmedTitle === "" || trimmedArtist === "") {
        return res.status(400).json({ error: "Title and artist cannot be empty" });
    }

    // Lenght check
    if (trimmedTitle.length > 100 || trimmedArtist.length > 100) {
        return res.status(400).json({ error: "Title and artist exceed maximum length" });
    }
    if (trimmedMessage !== undefined && trimmedMessage.length > 500) {
        return res.status(400).json({ error: "Message exceeds maximum length" });
    }

    // Pass validated and trimmed data to service
    const newSuggestion = await createSuggestion({
        title: trimmedTitle,
        artist: trimmedArtist,
        message: trimmedMessage,
    });

    return res.status(201).json(newSuggestion);
}