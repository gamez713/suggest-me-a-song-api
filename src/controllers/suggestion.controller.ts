import type { Request, Response } from "express";
import type { SongStatus } from "../models/songSuggestion.model.js";
import {
    createSuggestion,
    getAllSuggestions,
    getSuggestionById,
    updateSuggestionStatus,
    deleteSuggestion,
} from "../services/suggestion.service.js";

export async function getAllSuggestionsHandler(req: Request, res: Response) {
    const suggestions = await getAllSuggestions();

    return res.status(200).json(suggestions);
}

export async function getSuggestionByIdHandler(req: Request, res: Response) {
    const id = Number(req.params.id as string);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid id parameter" });
    }

    const suggestion = await getSuggestionById(id);

    if (!suggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
    }

    return res.status(200).json(suggestion);
}

export async function createSuggestionHandler(req: Request, res: Response) {
    const { spotifyTrackId, message } = req.body;

    if (!spotifyTrackId) {
        return res.status(400).json({ error: "Spotify track ID is required" });
    }
    if (typeof spotifyTrackId !== "string") {
        return res
            .status(400)
            .json({ error: "Spotify track ID must be a string" });
    }
    if (message !== undefined && typeof message !== "string") {
        return res.status(400).json({ error: "Message must be a string" });
    }

    const trimmedSpotifyTrackId = spotifyTrackId.trim();
    const trimmedMessage = message?.trim();

    if (trimmedSpotifyTrackId === "") {
        return res
            .status(400)
            .json({ error: "Spotify track ID cannot be empty" });
    }

    if (trimmedMessage !== undefined && trimmedMessage.length > 500) {
        return res
            .status(400)
            .json({ error: "Message exceeds maximum length" });
    }

    const newSuggestion = await createSuggestion({
        spotifyTrackId: trimmedSpotifyTrackId,
        message: trimmedMessage,
    });

    return res.status(201).json(newSuggestion);
}

export async function updateSuggestionStatusHandler(
    req: Request,
    res: Response
) {
    const id = Number(req.params.id as string);
    const { status } = req.body;
    const validStatuses: SongStatus[] = ["pending", "approved", "rejected"];

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid id parameter" });
    }

    if (
        typeof status !== "string" ||
        !validStatuses.includes(status as SongStatus)
    ) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    const validatedStatus = status as SongStatus;

    const updatedSuggestion = await updateSuggestionStatus(id, validatedStatus);

    if (!updatedSuggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
    }
    return res.status(200).json(updatedSuggestion);
}

export async function deleteSuggestionHandler(req: Request, res: Response) {
    const id = Number(req.params.id as string);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid id parameter" });
    }

    const deleted = await deleteSuggestion(id);

    if (!deleted) {
        return res.status(404).json({ error: "Suggestion not found" });
    }

    return res.status(204).send();
}
