export type SongStatus = "pending" | "approved" | "rejected";

export type SongSuggestion = {
    id: number;
    spotifyTrackId: string;
    message?: string;
    status: SongStatus;
    createdAt: string;
};
