import fs from "fs/promises";
import type { SongSuggestion } from "../models/songSuggestion.model.js";

const suggestionsFile = process.env.SUGGESTIONS_FILE || "data/suggestions.json";

export async function findAllSuggestions(): Promise<SongSuggestion[]> {
    const data = await fs.readFile(suggestionsFile, "utf-8");
    return JSON.parse(data);
}

export async function findSuggestionById(
    id: number
): Promise<SongSuggestion | null> {
    const suggestions = await findAllSuggestions();
    const suggestion =
        suggestions.find((suggestion) => suggestion.id === id) || null;

    return suggestion;
}

export async function saveSuggestion(
    input: SongSuggestion
): Promise<SongSuggestion> {
    const suggestions = await findAllSuggestions();

    suggestions.push(input);

    await fs.writeFile(suggestionsFile, JSON.stringify(suggestions, null, 2));

    return input;
}

export async function updateSuggestionById(
    input: SongSuggestion
): Promise<SongSuggestion> {
    const suggestions = await findAllSuggestions();
    const index = suggestions.findIndex(
        (suggestion) => suggestion.id === input.id
    );

    if (index === -1) {
        throw new Error(`Suggestion with id ${input.id} not found`);
    }

    suggestions[index] = input;

    await fs.writeFile(suggestionsFile, JSON.stringify(suggestions, null, 2));

    return input;
}

export async function deleteSuggestionById(id: number): Promise<boolean> {
    const suggestions = await findAllSuggestions();
    const filteredSuggestions = suggestions.filter(
        (suggestion) => suggestion.id !== id
    );

    if (filteredSuggestions.length === suggestions.length) {
        return false;
    }

    await fs.writeFile(
        suggestionsFile,
        JSON.stringify(filteredSuggestions, null, 2)
    );

    return true;
}
