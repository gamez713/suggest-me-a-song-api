import type { Request, Response } from "express";
import type { SongStatus } from "../models/SongSuggestion.js";
import {
    createSuggestion,
    getAllSuggestions,
    getSuggestionById,
    updateSuggestionStatus,
    deleteSuggestion
} from "../services/suggestions.service.js";

// CREATE operations
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

// READ operations
export async function getSuggestionsHandler(req: Request, res: Response) {
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
    const suggestion = await getSuggestionById(id);

    if (!suggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
    }

    return res.status(200).json(suggestion);
}

// UPDATE operations
export async function updateSuggestionStatusHandler(req: Request, res: Response) {
    const id = parseInt(req.params.id as string, 10);
    const { status } = req.body;
    const validStatuses: SongStatus[] = ["pending", "approved", "rejected"];

    // Validate id
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid id parameter" });
    }

    // Validate status
    if (typeof status !== "string" || !validStatuses.includes(status as SongStatus)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    const validatedStatus = status as SongStatus;

    // Update suggestion status in service
    const updatedSuggestion = await updateSuggestionStatus(id, validatedStatus);

    if (!updatedSuggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
    }
    return res.status(200).json(updatedSuggestion);
}

// DELETE operations
export async function deleteSuggestionHandler(req: Request, res: Response) {
    const id = parseInt(req.params.id as string, 10);

    // Validate id
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid id parameter" });
    }

    const deleted = await deleteSuggestion(id);

    if (!deleted) {
        return res.status(404).json({ error: "Suggestion not found" });
    }

    return res.status(204).send();
}