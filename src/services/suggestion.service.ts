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

    const suggestions = await findAllSuggestions();

    let maxId = 0;

    for (const suggestion of suggestions) {
        if (suggestion.id > maxId) {
            maxId = suggestion.id;
        }
    }

    const newId = maxId + 1;

    const newSuggestion: SongSuggestion = {
        id: newId,
        spotifyTrackId: input.spotifyTrackId,
        status: "pending",
        createdAt: new Date().toISOString(),
    };

    if (input.message !== undefined) {
        newSuggestion.message = input.message;
    }

    await saveSuggestion(newSuggestion);

    return newSuggestion;
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

    await updateSuggestionById(suggestion);

    return suggestion;
}

export async function deleteSuggestion(id: number): Promise<boolean> {
    return deleteSuggestionById(id);
}
