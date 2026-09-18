export type SpotifyTrack = {
    spotifyTrackId: string;
    name: string;
    artists: Array<{
        id: string;
        name: string;
    }>;
    album: {
        id: string;
        name: string;
        imageUrl: string | null;
    };
    spotifyUrl: string;
    durationMs: number;
    explicit: boolean;
    popularity: number;
};

export type SpotifyTrackSearchResult = {
    spotifyTrackId: string;
    name: string;
    artists: Array<{
        id: string;
        name: string;
    }>;
    album: {
        id: string;
        name: string;
        imageUrl: string | null;
    };
    spotifyUrl: string;
};
