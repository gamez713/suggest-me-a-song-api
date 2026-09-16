import type { SongSuggestion, SongStatus } from "../models/songSuggestion.model.js";
import {
    findAllSuggestions,
    findSuggestionById,
    saveSuggestion,
    updateSuggestionById,
    deleteSuggestionById
} from "../repositories/suggestion.repository.js";

import { getTrackBySpotifyId, saveTrack } from "../repositories/track.repository.js";
import { getSpotifyTrack } from "./spotify.service.js";

// READ operations
export async function getAllSuggestions(): Promise<SongSuggestion[]> {

    return findAllSuggestions();
}
export async function getSuggestionById(id: number): Promise<SongSuggestion | null> {

    return findSuggestionById(id);
}

// CREATE operations
export async function createSuggestion(input: {
    spotifyTrackId: string;
    message?: string;
}): Promise<SongSuggestion> {

    // Check if the track already exists in the local storage
    const existingTrack = await getTrackBySpotifyId(input.spotifyTrackId);

    // If the track does not exist, fetch it from Spotify and save it to the local storage
    if (!existingTrack) {
        const spotifyTrack = await getSpotifyTrack(input.spotifyTrackId);
        await saveTrack(spotifyTrack);
    }

    const suggestions = await findAllSuggestions();

    // Generate next suggestion ID
    let maxId = 0;
    for (const suggestion of suggestions) {
        if (suggestion.id > maxId) {
            maxId = suggestion.id;
        }
    }
    const newId = maxId + 1;

    // Create new suggestion object
    const newSuggestion: SongSuggestion = {
        id: newId,
        spotifyTrackId: input.spotifyTrackId,
        status: "pending",
        createdAt: new Date().toISOString(),
    };
    if (input.message !== undefined) {
        newSuggestion.message = input.message;
    }

    // Send the new suggestion to the repository to be saved
    await saveSuggestion(newSuggestion);

    return newSuggestion;
}

// UPDATE operations
export async function updateSuggestionStatus(id: number, status: SongStatus): Promise<SongSuggestion | null> {

    const suggestion = await findSuggestionById(id);

    if (!suggestion) {
        return null;
    }
    suggestion.status = status;

    await updateSuggestionById(suggestion);

    return suggestion;
}

// DELETE operations
export async function deleteSuggestion(id: number): Promise<boolean> {

    return deleteSuggestionById(id);
}