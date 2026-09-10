export type SpotifyTrackMetadata = {
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