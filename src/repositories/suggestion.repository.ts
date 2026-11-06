import fs from "fs/promises";
import type { SongSuggestion } from "../models/songSuggestion.model.js";

import { pool } from "../db/pool.js";

const suggestionsFile = process.env.SUGGESTIONS_FILE || "data/suggestions.json";

type SuggestionRow = {
    id: number;
    spotify_track_id: string;
    message: string | null;
    status: SongSuggestion["status"];
    created_at: Date;
};

function mapSuggestionRow(row: SuggestionRow): SongSuggestion {
    return {
        id: row.id,
        spotifyTrackId: row.spotify_track_id,
        ...(row.message !== null ? { message: row.message } : {}),
        status: row.status,
        createdAt: row.created_at.toISOString(),
    };
}

export async function findAllSuggestions(): Promise<SongSuggestion[]> {
    const sql = `
        SELECT
            s.id,
            t.spotify_track_id,
            s.message,
            s.status,
            s.created_at
        FROM suggestions AS s
        JOIN tracks AS t
            ON s.track_id = t.id
        ORDER BY s.created_at DESC, s.id DESC;
    `;

    const result = await pool.query<SuggestionRow>(sql);

    return result.rows.map(mapSuggestionRow);
}

export async function findSuggestionById(
    id: number
): Promise<SongSuggestion | null> {
    const sql = `
        SELECT
            s.id,
            t.spotify_track_id,
            s.message,
            s.status,
            s.created_at
        FROM suggestions AS s
        JOIN tracks AS t
            ON s.track_id = t.id
        WHERE s.id = $1;
    `;

    const result = await pool.query<SuggestionRow>(sql, [id]);
    const row = result.rows[0];

    if (!row) {
        return null;
    }

    return mapSuggestionRow(row);
}

export async function saveSuggestion(
    input: Omit<SongSuggestion, "id" | "createdAt">
): Promise<SongSuggestion> {
    const trackSql = `
        SELECT id
        FROM tracks
        WHERE spotify_track_id = $1;
    `;

    const trackResult = await pool.query<{ id: number }>(trackSql, [
        input.spotifyTrackId,
    ]);
    const trackRow = trackResult.rows[0];

    if (!trackRow) {
        throw new Error(
            `Track with spotify_track_id ${input.spotifyTrackId} not found`
        );
    }

    const insertSql = `
        INSERT INTO suggestions (track_id, message, status)
        VALUES ($1, $2, $3)
        RETURNING id, created_at;
    `;

    const insertResult = await pool.query<{ id: number; created_at: Date }>(
        insertSql,
        [trackRow.id, input.message ?? null, input.status]
    );

    const insertedRow = insertResult.rows[0];

    if (!insertedRow) {
        throw new Error("Failed to insert suggestion");
    }

    return {
        id: insertedRow.id,
        spotifyTrackId: input.spotifyTrackId,
        ...(input.message !== undefined ? { message: input.message } : {}),
        status: input.status,
        createdAt: insertedRow.created_at.toISOString(),
    };
}

export async function updateSuggestionById(
    input: SongSuggestion
): Promise<SongSuggestion> {
    const updateSql = `
        UPDATE suggestions
        SET message = $1, status = $2
        WHERE id = $3
        RETURNING created_at;
    `;

    const updateResult = await pool.query<{ created_at: Date }>(updateSql, [
        input.message ?? null,
        input.status,
        input.id,
    ]);

    const updatedRow = updateResult.rows[0];

    if (!updatedRow) {
        throw new Error(`Suggestion with id ${input.id} not found`);
    }

    return {
        id: input.id,
        spotifyTrackId: input.spotifyTrackId,
        ...(input.message !== undefined ? { message: input.message } : {}),
        status: input.status,
        createdAt: updatedRow.created_at.toISOString(),
    };
}

export async function deleteSuggestionById(id: number): Promise<boolean> {
    const deleteSql = `
        DELETE FROM suggestions
        WHERE id = $1;
    `;

    const deleteResult = await pool.query(deleteSql, [id]);

    return deleteResult.rowCount === 1;
}
