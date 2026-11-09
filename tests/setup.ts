import { beforeEach, afterAll } from "vitest";
import { pool } from "../src/db/pool.js";

beforeEach(async () => {
    const result = await pool.query<{ current_database: string }>(
        "SELECT current_database();"
    );

    if (result.rows[0]?.current_database !== "suggest_me_a_song_test") {
        throw new Error(
            "Test database safety check failed: refusing to clear tables"
        );
    }

    await pool.query(`
        TRUNCATE TABLE suggestions, track_artists, tracks, albums, artists
        RESTART IDENTITY CASCADE;
    `);
});

afterAll(async () => {
    await pool.end();
});
