import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { encryptToken, decryptToken } from "../src/utils/tokenEncryption.js";

const repositoryMocks = vi.hoisted(() => ({
    getStoredEncryptedRefreshToken: vi.fn(),
    saveEncryptedRefreshToken: vi.fn(),
}));

vi.mock("../src/repositories/spotifyAuth.repository.js", () => ({
    getStoredEncryptedRefreshToken:
        repositoryMocks.getStoredEncryptedRefreshToken,
    saveEncryptedRefreshToken: repositoryMocks.saveEncryptedRefreshToken,
}));

type SpotifyService = typeof import("../src/services/spotify.service.js");

let spotifyService: SpotifyService;

function mockResponse(body: unknown, status = 200): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
        text: async () => JSON.stringify(body),
    } as Response;
}

function mockSearchResponse(): Response {
    return mockResponse({
        tracks: {
            items: [],
        },
    });
}

beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    repositoryMocks.getStoredEncryptedRefreshToken.mockResolvedValue(
        encryptToken("test_refresh_token")
    );

    repositoryMocks.saveEncryptedRefreshToken.mockResolvedValue(undefined);

    spotifyService = await import("../src/services/spotify.service.js");
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("Spotify token refresh", () => {
    it("refreshes a stored token and reuses the access token", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                mockResponse({
                    access_token: "new_access_token",
                    token_type: "Bearer",
                    expires_in: 3600,
                })
            )
            .mockResolvedValueOnce(mockSearchResponse())
            .mockResolvedValueOnce(mockSearchResponse());

        vi.stubGlobal("fetch", fetchMock);

        await spotifyService.searchSpotifyTracks("test song");
        await spotifyService.searchSpotifyTracks("another song");

        expect(fetchMock).toHaveBeenCalledTimes(3);

        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            "https://accounts.spotify.com/api/token",
            expect.objectContaining({
                method: "POST",
                body: expect.stringContaining(
                    "refresh_token=test_refresh_token"
                ),
            })
        );

        for (const callNumber of [2, 3]) {
            expect(fetchMock).toHaveBeenNthCalledWith(
                callNumber,
                expect.stringContaining("https://api.spotify.com/v1/search?"),
                expect.objectContaining({
                    headers: {
                        Authorization: "Bearer new_access_token",
                    },
                })
            );
        }

        expect(
            repositoryMocks.getStoredEncryptedRefreshToken
        ).toHaveBeenCalledTimes(1);

        expect(
            repositoryMocks.saveEncryptedRefreshToken
        ).not.toHaveBeenCalled();
    });

    it("encrypts and persists a replacement refresh token", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                mockResponse({
                    access_token: "rotated_access_token",
                    token_type: "Bearer",
                    expires_in: 3600,
                    refresh_token: "replacement_refresh_token",
                })
            )
            .mockResolvedValueOnce(mockSearchResponse());

        vi.stubGlobal("fetch", fetchMock);

        await spotifyService.searchSpotifyTracks("test song");

        expect(repositoryMocks.saveEncryptedRefreshToken).toHaveBeenCalledTimes(
            1
        );

        const encryptedToken =
            repositoryMocks.saveEncryptedRefreshToken.mock.calls[0]?.[0];

        expect(typeof encryptedToken).toBe("string");
        expect(encryptedToken).not.toBe("replacement_refresh_token");
        expect(decryptToken(encryptedToken)).toBe("replacement_refresh_token");

        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining("https://api.spotify.com/v1/search?"),
            expect.objectContaining({
                headers: {
                    Authorization: "Bearer rotated_access_token",
                },
            })
        );
    });

    it("recovers after a failed token refresh", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(mockResponse({ error: "server_error" }, 500))
            .mockResolvedValueOnce(
                mockResponse({
                    access_token: "recovered_access_token",
                    token_type: "Bearer",
                    expires_in: 3600,
                })
            )
            .mockResolvedValueOnce(mockSearchResponse());

        vi.stubGlobal("fetch", fetchMock);

        await expect(
            spotifyService.searchSpotifyTracks("first attempt")
        ).rejects.toThrow("Spotify token refresh failed");

        await expect(
            spotifyService.searchSpotifyTracks("second attempt")
        ).resolves.toEqual([]);

        expect(fetchMock).toHaveBeenCalledTimes(3);

        expect(fetchMock).toHaveBeenNthCalledWith(
            3,
            expect.stringContaining("https://api.spotify.com/v1/search?"),
            expect.objectContaining({
                headers: {
                    Authorization: "Bearer recovered_access_token",
                },
            })
        );
    });

    it("shares one refresh request between concurrent searches", async () => {
        const fetchMock = vi.fn(async (url: string) => {
            if (url === "https://accounts.spotify.com/api/token") {
                return mockResponse({
                    access_token: "shared_access_token",
                    token_type: "Bearer",
                    expires_in: 3600,
                });
            }

            return mockSearchResponse();
        });

        vi.stubGlobal("fetch", fetchMock);

        const results = await Promise.all([
            spotifyService.searchSpotifyTracks("first song"),
            spotifyService.searchSpotifyTracks("second song"),
            spotifyService.searchSpotifyTracks("third song"),
        ]);

        expect(results).toEqual([[], [], []]);

        const refreshCalls = fetchMock.mock.calls.filter(
            ([url]) => url === "https://accounts.spotify.com/api/token"
        );

        expect(refreshCalls).toHaveLength(1);
        expect(fetchMock).toHaveBeenCalledTimes(4);
    });

    it("rejects requests when no refresh token exists", async () => {
        repositoryMocks.getStoredEncryptedRefreshToken.mockResolvedValue(null);

        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        await expect(
            spotifyService.searchSpotifyTracks("test song")
        ).rejects.toThrow("Spotify refresh token is not available");

        expect(fetchMock).not.toHaveBeenCalled();
    });
});
