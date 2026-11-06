import type {
    SongSuggestion,
    SongStatus,
} from "../models/songSuggestion.model.js";

import {
    findAllSuggestions,
    findSuggestionById,
    saveSuggestion,
    updateSuggestionById,
    deleteSuggestionById,
} from "../repositories/suggestion.repository.js";

import {
    getTrackBySpotifyId,
    saveTrack,
} from "../repositories/track.repository.js";

import {
    addTrackToSpotifyPlaylist,
    getSpotifyTrack,
} from "./spotify.service.js";

export async function getAllSuggestions(): Promise<SongSuggestion[]> {
    return findAllSuggestions();
}

export async function getSuggestionById(
    id: number
): Promise<SongSuggestion | null> {
    return findSuggestionById(id);
}

export async function createSuggestion(input: {
    spotifyTrackId: string;
    message?: string;
}): Promise<SongSuggestion> {
    const existingTrack = await getTrackBySpotifyId(input.spotifyTrackId);

    if (!existingTrack) {
        const spotifyTrack = await getSpotifyTrack(input.spotifyTrackId);
        await saveTrack(spotifyTrack);
    }

    const newSuggestion = {
        spotifyTrackId: input.spotifyTrackId,
        ...(input.message !== undefined ? { message: input.message } : {}),
        status: "pending" as const,
    };

    return saveSuggestion(newSuggestion);
}

export async function updateSuggestionStatus(
    id: number,
    status: SongStatus
): Promise<SongSuggestion | null> {
    const suggestion = await findSuggestionById(id);

    if (!suggestion) {
        return null;
    }

    if (status === "approved") {
        await addTrackToSpotifyPlaylist(suggestion.spotifyTrackId);
    }

    suggestion.status = status;

    return updateSuggestionById(suggestion);
}

export async function deleteSuggestion(id: number): Promise<boolean> {
    return deleteSuggestionById(id);
}
