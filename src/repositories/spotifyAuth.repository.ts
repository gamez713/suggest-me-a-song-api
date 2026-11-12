import { pool } from "../db/pool.js";

type SpotifyAuthRow = {
    encrypted_refresh_token: string;
};

export async function getStoredEncryptedRefreshToken(): Promise<string | null> {
    const sql = `
        SELECT encrypted_refresh_token
        FROM spotify_auth
        WHERE id = 1;
    `;

    const result = await pool.query<SpotifyAuthRow>(sql);

    return result.rows[0]?.encrypted_refresh_token ?? null;
}

export async function saveEncryptedRefreshToken(
    encryptedRefreshToken: string
): Promise<void> {
    const sql = `
        INSERT INTO spotify_auth (id, encrypted_refresh_token)
        VALUES (1, $1)
        ON CONFLICT (id)
        DO UPDATE SET
            encrypted_refresh_token = EXCLUDED.encrypted_refresh_token,
            updated_at = CURRENT_TIMESTAMP;
    `;

    await pool.query(sql, [encryptedRefreshToken]);
}
