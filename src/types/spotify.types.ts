export type SpotifyTokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope?: string;
};

export type SpotifyTrackResponse = {
    id: string;
    name: string;
    artists: Array<{
        id: string;
        name: string;
    }>;
    album: {
        id: string;
        name: string;
        images: Array<{
            url: string;
        }>;
    };
    external_urls: {
        spotify: string;
    };
    duration_ms: number;
    explicit: boolean;
    popularity: number;
};