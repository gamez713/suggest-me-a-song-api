import { randomBytes } from "node:crypto";

export type SpotifyTokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope?: string;
};

let spotifyAuthState: string | null = null;

// Stored in memory temporarily during development
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

// Validates the state parameter returned from Spotify's OAuth flow to prevent CSRF attacks
export function validateSpotifyAuthState(state: string): boolean {
    // Compare returned state with the one stored during initial authorization request
    const isValid = spotifyAuthState !== null && spotifyAuthState === state;

    if (isValid) {
        // Clear the stored state after successful validation to prevent reuse
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
        throw new Error(`Spotify token exchange failed: ${response.status} ${errorText}`);
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