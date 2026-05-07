import fs from "fs/promises";
import type { SongSuggestion } from "../models/SongSuggestion.js";

export async function getAllSuggestions(): Promise<SongSuggestion[]> {
    const data = await fs.readFile("data/suggestions.json", "utf-8");
    return JSON.parse(data);
}

export async function createSuggestion(input: {
    title: string;
    artist: string;
    message: string;
}): Promise<SongSuggestion> {

    const suggestions = await getAllSuggestions();

    // generate id
    let maxId = 0;
    
    for (const suggestion of suggestions) {
        if (suggestion.id > maxId) {
            maxId = suggestion.id;
        }
    }
    const newId = maxId + 1;
    
    // create object
    const newSuggestion: SongSuggestion = {
        id: newId,
        title: input.title.trim(),
        artist: input.artist.trim(),
        message: input.message?.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
    };

    // push to array
    suggestions.push(newSuggestion);

    await fs.writeFile(
        "data/suggestions.json",
        JSON.stringify(suggestions, null, 2)
    );

    // return new suggestion
    return newSuggestion;
}