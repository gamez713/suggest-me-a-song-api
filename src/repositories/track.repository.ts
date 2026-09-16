import fs from "fs/promises";
import type { SpotifyTrackMetadata } from "../models/spotifyTrack.model.js";

const tracksFile = process.env.TRACKS_FILE || "data/tracks.json";

// READ operations
export async function getAllTracks(): Promise<SpotifyTrackMetadata[]> {

    const data = await fs.readFile(tracksFile, "utf-8");

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
        tracksFile,
        JSON.stringify(tracks, null, 2));

    return input;
}