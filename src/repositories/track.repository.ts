import fs from "fs/promises";
import type { SpotifyTrack } from "../models/spotifyTrack.model.js";

const tracksFile = process.env.TRACKS_FILE || "data/tracks.json";

export async function getAllTracks(): Promise<SpotifyTrack[]> {
    const data = await fs.readFile(tracksFile, "utf-8");

    return JSON.parse(data);
}
export async function getTrackBySpotifyId(
    spotifyTrackId: string
): Promise<SpotifyTrack | null> {
    const tracks = await getAllTracks();
    const track =
        tracks.find((track) => track.spotifyTrackId === spotifyTrackId) || null;

    return track;
}

export async function saveTrack(input: SpotifyTrack): Promise<SpotifyTrack> {
    const tracks = await getAllTracks();
    tracks.push(input);

    await fs.writeFile(tracksFile, JSON.stringify(tracks, null, 2));

    return input;
}
