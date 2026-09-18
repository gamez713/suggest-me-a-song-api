import { beforeEach } from "vitest";
import fs from "fs/promises";

process.env.SUGGESTIONS_FILE = "tests/data/suggestions.json";
process.env.TRACKS_FILE = "tests/data/tracks.json";

// Reset the suggestions.json file to an empty array before each test
beforeEach(async () => {
    await fs.writeFile(
        "tests/data/suggestions.json",
        JSON.stringify([], null, 2)
    );
    await fs.writeFile("tests/data/tracks.json", JSON.stringify([], null, 2));
});
