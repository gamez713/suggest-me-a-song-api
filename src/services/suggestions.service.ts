import fs from "fs/promises";
import type { SongSuggestion } from "../models/SongSuggestion.js";

export async function getAllSuggestions(): Promise<SongSuggestion[]> {
    // Suggestion currently stored in JSON file
    const data = await fs.readFile("data/suggestions.json", "utf-8");
    return JSON.parse(data);
}

export async function createSuggestion(input: {
    title: string;
    artist: string;
    message: string;
}): Promise<SongSuggestion> {

    const suggestions = await getAllSuggestions();

    // Generate id
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
        message: input.message,
        status: "pending",
        createdAt: new Date().toISOString(),
    };

    // Push new suggestion to array and write to file
    suggestions.push(newSuggestion);
    await fs.writeFile(
        "data/suggestions.json",
        JSON.stringify(suggestions, null, 2)
    );

    // return new suggestion
    return newSuggestion;
}