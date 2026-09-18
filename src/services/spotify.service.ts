import { randomBytes } from "node:crypto";
import type {
    SpotifyTrack,
    SpotifyTrackSearchResult,
} from "../models/spotifyTrack.model.js";
import type {
    SpotifyTokenResponse,
    SpotifyTrackSearchResponse,
    SpotifyTrackResponse,
} from "../types/spotify.types.js";

let spotifyAuthState: string | null = null;

// Spotify tokens are temporarily stored in memory during development.
let spotifyAccessToken: string | null = null;
let spotifyRefreshToken: string | null = null;

export function getSpotifyAuthorizeUrl(): string {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        throw new Error(
            "Spotify is not fully configured. Missing required environment variables."
        );
    }

    spotifyAuthState = randomBytes(32).toString("hex");

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: "playlist-modify-public",
        state: spotifyAuthState,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export function validateSpotifyAuthState(state: string): boolean {
    const isValid = spotifyAuthState !== null && spotifyAuthState === state;

    if (isValid) {
        spotifyAuthState = null;
    }

    return isValid;
}

export async function exchangeSpotifyCodeForToken(
    code: string
): Promise<SpotifyTokenResponse> {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error(
            "Spotify is not fully configured. Missing required environment variables."
        );
    }

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: body.toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Spotify token exchange failed: ${response.status} ${errorText}`
        );
    }

    const tokenData = (await response.json()) as SpotifyTokenResponse;

    spotifyAccessToken = tokenData.access_token;
    spotifyRefreshToken = tokenData.refresh_token ?? null;

    return tokenData;
}

export function getStoredSpotifyAccessToken(): string | null {
    return spotifyAccessToken;
}

export function getStoredSpotifyRefreshToken(): string | null {
    return spotifyRefreshToken;
}

function requireSpotifyAccessToken(): string {
    const accessToken = getStoredSpotifyAccessToken();

    if (!accessToken) {
        throw new Error(
            "Spotify access token is not available. Authorize with Spotify first."
        );
    }

    return accessToken;
}

export async function getSpotifyTrack(trackId: string): Promise<SpotifyTrack> {
    const accessToken = requireSpotifyAccessToken();

    const response = await fetch(
        `https://api.spotify.com/v1/tracks/${encodeURIComponent(trackId)}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Spotify track request failed: ${response.status} ${errorText}`
        );
    }

    const spotifyTrack = (await response.json()) as SpotifyTrackResponse;

    return {
        spotifyTrackId: spotifyTrack.id,
        name: spotifyTrack.name,
        artists: spotifyTrack.artists.map((artist) => ({
            id: artist.id,
            name: artist.name,
        })),
        album: {
            id: spotifyTrack.album.id,
            name: spotifyTrack.album.name,
            imageUrl: spotifyTrack.album.images[0]?.url ?? null,
        },
        spotifyUrl: spotifyTrack.external_urls.spotify,
        durationMs: spotifyTrack.duration_ms,
        explicit: spotifyTrack.explicit,
        popularity: spotifyTrack.popularity,
    };
}

export async function searchSpotifyTracks(
    query: string
): Promise<SpotifyTrackSearchResult[]> {
    const accessToken = requireSpotifyAccessToken();

    const params = new URLSearchParams({
        q: query,
        type: "track",
        limit: "10",
    });

    const response = await fetch(
        `https://api.spotify.com/v1/search?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Spotify track search failed: ${response.status} ${errorText}`
        );
    }

    const searchResponse =
        (await response.json()) as SpotifyTrackSearchResponse;

    return searchResponse.tracks.items.map((track) => ({
        spotifyTrackId: track.id,
        name: track.name,
        artists: track.artists.map((artist) => ({
            id: artist.id,
            name: artist.name,
        })),
        album: {
            id: track.album.id,
            name: track.album.name,
            imageUrl: track.album.images[0]?.url ?? null,
        },
        spotifyUrl: track.external_urls.spotify,
    }));
}

export async function addTrackToSpotifyPlaylist(
    spotifyTrackId: string
): Promise<void> {
    const accessToken = requireSpotifyAccessToken();

    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

    if (!playlistId) {
        throw new Error(
            "Spotify playlist ID is not configured. Set SPOTIFY_PLAYLIST_ID in environment variables."
        );
    }

    const response = await fetch(
        `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}/items`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uris: [`spotify:track:${spotifyTrackId}`],
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to add track to Spotify playlist: ${response.status} ${errorText}`
        );
    }
}
