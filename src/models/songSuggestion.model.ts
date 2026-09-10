export type SongStatus = "pending" | "approved" | "rejected";

export type SongSuggestion = {
  id: number;
  title: string;
  artist: string;
  message?: string;
  status: SongStatus;
  createdAt: string;
};