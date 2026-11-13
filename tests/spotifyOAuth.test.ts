import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const spotifyMocks = vi.hoisted(() => ({
    exchangeSpotifyCodeForToken: vi.fn(),
}));

vi.mock("../src/services/spotify.service.js", async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import("../src/services/spotify.service.js")
        >();

    return {
        ...actual,
        exchangeSpotifyCodeForToken: spotifyMocks.exchangeSpotifyCodeForToken,
    };
});

import app from "../src/app.js";
import {
    getSpotifyAuthorizeUrl,
    validateSpotifyAuthState,
} from "../src/services/spotify.service.js";

const adminKey = process.env.ADMIN_API_KEY!;

function getState(url: string): string {
    const state = new URL(url).searchParams.get("state");

    if (!state) {
        throw new Error("Authorization URL has no state");
    }

    return state;
}

beforeEach(() => {
    vi.useRealTimers();
    spotifyMocks.exchangeSpotifyCodeForToken.mockReset();
    spotifyMocks.exchangeSpotifyCodeForToken.mockResolvedValue({
        access_token: "test_access_token",
        refresh_token: "test_refresh_token",
        token_type: "Bearer",
        expires_in: 3600,
    });
});

afterEach(() => {
    vi.useRealTimers();
});

describe("Spotify OAuth security", () => {
    it("rejects login without an admin key", async () => {
        const response = await request(app).get("/spotify/login");

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: "Unauthorized" });
    });

    it("rejects login with an invalid admin key", async () => {
        const response = await request(app)
            .get("/spotify/login")
            .set("x-admin-key", "invalid_key");

        expect(response.status).toBe(401);
    });

    it("returns an authorization URL for an admin", async () => {
        const response = await request(app)
            .get("/spotify/login")
            .set("x-admin-key", adminKey);

        expect(response.status).toBe(200);

        const url = new URL(response.body.authorizeUrl);

        expect(url.origin).toBe("https://accounts.spotify.com");
        expect(url.pathname).toBe("/authorize");
        expect(url.searchParams.get("response_type")).toBe("code");
        expect(url.searchParams.get("client_id")).toBe(
            process.env.SPOTIFY_CLIENT_ID
        );
        expect(url.searchParams.get("state")).toBeTruthy();

        validateSpotifyAuthState(getState(response.body.authorizeUrl));
    });

    it("rejects overlapping authorization attempts", () => {
        const firstUrl = getSpotifyAuthorizeUrl();

        expect(() => getSpotifyAuthorizeUrl()).toThrow(
            "Spotify authorization is already in progress."
        );

        validateSpotifyAuthState(getState(firstUrl));
    });

    it("accepts a valid state only once", () => {
        const url = getSpotifyAuthorizeUrl();
        const state = getState(url);

        expect(validateSpotifyAuthState(state)).toBe(true);
        expect(validateSpotifyAuthState(state)).toBe(false);
    });

    it("rejects an invalid state", () => {
        const url = getSpotifyAuthorizeUrl();

        expect(validateSpotifyAuthState("invalid_state")).toBe(false);

        // The invalid attempt consumes the pending state.
        expect(validateSpotifyAuthState(getState(url))).toBe(false);
    });

    it("rejects an expired state", () => {
        vi.useFakeTimers();

        const url = getSpotifyAuthorizeUrl();
        const state = getState(url);

        vi.advanceTimersByTime(5 * 60 * 1000 + 1);

        expect(validateSpotifyAuthState(state)).toBe(false);
    });

    it("rejects callback requests with an invalid state", async () => {
        const response = await request(app).get("/spotify/callback").query({
            code: "fake_authorization_code",
            state: "invalid_state",
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: "Invalid OAuth state",
        });

        expect(spotifyMocks.exchangeSpotifyCodeForToken).not.toHaveBeenCalled();
    });

    it("exchanges the code after valid state validation", async () => {
        const url = getSpotifyAuthorizeUrl();
        const state = getState(url);

        const response = await request(app).get("/spotify/callback").query({
            code: "fake_authorization_code",
            state,
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "Spotify authorization successful",
        });

        expect(
            spotifyMocks.exchangeSpotifyCodeForToken
        ).toHaveBeenCalledExactlyOnceWith("fake_authorization_code");
    });
});
