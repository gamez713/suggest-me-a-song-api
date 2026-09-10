import fs from "fs/promises";
import type { SongSuggestion, SongStatus } from "../models/songSuggestion.model.js";

// CREATE operations
export async function createSuggestion(input: {
    title: string;
    artist: string;
    message?: string;
}): Promise<SongSuggestion> {

    const suggestions = await getAllSuggestions();

    // Generate next suggestionid
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
        title: input.title,
        artist: input.artist,
        status: "pending",
        createdAt: new Date().toISOString(),
    };
    if (input.message !== undefined) {
        newSuggestion.message = input.message;
    }

    // Push new suggestion to array and write to file
    suggestions.push(newSuggestion);
    await fs.writeFile(
        "data/suggestions.json",
        JSON.stringify(suggestions, null, 2)
    );

    // return new suggestion
    return newSuggestion;
}

// READ operations
export async function getAllSuggestions(): Promise<SongSuggestion[]> {

    const data = await fs.readFile("data/suggestions.json", "utf-8");
    return JSON.parse(data);
}

export async function getSuggestionById(id: number): Promise<SongSuggestion | null> {

    const suggestions = await getAllSuggestions();
    const suggestion = suggestions.find((suggestion) => suggestion.id === id) || null;

    return suggestion;
}

// UPDATE operations
export async function updateSuggestionStatus(id: number, status: SongStatus): Promise<SongSuggestion | null> {

    const suggestions = await getAllSuggestions();
    const suggestion = suggestions.find((suggestion) => suggestion.id === id) || null;

    if (!suggestion) {
        return null;
    }
    suggestion.status = status;

    // Write updated suggestions back to file
    await fs.writeFile(
        "data/suggestions.json",
        JSON.stringify(suggestions, null, 2)
    );

    return suggestion;
}

// DELETE operations
export async function deleteSuggestion(id: number): Promise<boolean> {
    const suggestions = await getAllSuggestions();

    // Filter out the suggestion with the given id
    const filteredSuggestions = suggestions.filter((suggestion) => suggestion.id !== id);

    // If no suggestion was removed, return false
    if (filteredSuggestions.length === suggestions.length) {
        return false;
    }

    await fs.writeFile(
        "data/suggestions.json",
        JSON.stringify(filteredSuggestions, null, 2)
    );

    return true;
}