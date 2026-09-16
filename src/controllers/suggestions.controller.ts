import type { Request, Response } from "express";
import type { SongStatus } from "../models/songSuggestion.model.js";
import {
    createSuggestion,
    getAllSuggestions,
    getSuggestionById,
    updateSuggestionStatus,
    deleteSuggestion
} from "../services/suggestions.service.js";

// READ operations
export async function getSuggestionsHandler(req: Request, res: Response) {
    const suggestions = await getAllSuggestions();

    return res.status(200).json(suggestions);
}

export async function getSuggestionByIdHandler(req: Request, res: Response) {
    const id = parseInt(req.params.id as string, 10);

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

// CREATE operations
export async function createSuggestionHandler(req: Request, res: Response) {
    const { spotifyTrackId, message } = req.body;

    // Validate required fields
    if (!spotifyTrackId) {
        return res.status(400).json({ error: "Spotify track ID is required" });
    }
    // Validate types
    if (typeof spotifyTrackId !== "string") {
        return res.status(400).json({ error: "Spotify track ID must be a string" });
    }
    if (message !== undefined && typeof message !== "string") {
        return res.status(400).json({ error: "Message must be a string" });
    }

    const trimmedSpotifyTrackId = spotifyTrackId.trim();
    const trimmedMessage = message?.trim();

    // Empty string check
    if (trimmedSpotifyTrackId === "") {
        return res.status(400).json({ error: "Spotify track ID cannot be empty" });
    }

    // Length check
    if (trimmedSpotifyTrackId.length > 100) {
        return res.status(400).json({ error: "Spotify track ID exceeds maximum length" });
    }
    if (trimmedMessage !== undefined && trimmedMessage.length > 500) {
        return res.status(400).json({ error: "Message exceeds maximum length" });
    }

    // Pass validated and trimmed data to service
    const newSuggestion = await createSuggestion({
        spotifyTrackId: trimmedSpotifyTrackId,
        message: trimmedMessage,
    });

    return res.status(201).json(newSuggestion);
}

// UPDATE operations
export async function updateSuggestionStatusHandler(req: Request, res: Response) {
    const id = parseInt(req.params.id as string, 10);
    const { status } = req.body;
    const validStatuses: SongStatus[] = ["pending", "approved", "rejected"];

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

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid id parameter" });
    }

    const deleted = await deleteSuggestion(id);

    if (!deleted) {
        return res.status(404).json({ error: "Suggestion not found" });
    }

    return res.status(204).send();
}