import fs from "fs/promises";
import type { SpotifyTrackMetadata } from "../models/spotifyTrack.model.js";

// READ operations
export async function getAllTracks(): Promise<SpotifyTrackMetadata[]> {

    const data = await fs.readFile("data/tracks.json", "utf-8");

    return JSON.parse(data);
}
export async function getTrackBySpotifyId(spotifyTrackId: string): Promise<SpotifyTrackMetadata | null> {

    const tracks = await getAllTracks();
    const track = tracks.find((track) => track.spotifyTrackId === spotifyTrackId) || null;

    return track;
}

// CREATE operations
export async function saveTrack(input: SpotifyTrackMetadata): Promise<SpotifyTrackMetadata> {
    
    const tracks = await getAllTracks();
    tracks.push(input);
    await fs.writeFile(
        "data/tracks.json",
        JSON.stringify(tracks, null, 2));

    return input;
}