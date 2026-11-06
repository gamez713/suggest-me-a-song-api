import type { SpotifyTrack } from "../models/spotifyTrack.model.js";
import { pool } from "../db/pool.js";

type TrackRow = {
    spotify_track_id: string;
    name: string;
    spotify_url: string;
    duration_ms: number;
    explicit: boolean;
    popularity: number;
    spotify_album_id: string;
    album_name: string;
    album_type: string;
    image_url: string | null;
    spotify_artist_id: string;
    artist_name: string;
    artist_order: number;
};

export async function getTrackBySpotifyId(
    spotifyTrackId: string
): Promise<SpotifyTrack | null> {
    const sql = `
        SELECT
            t.spotify_track_id,
            t.name,
            t.spotify_url,
            t.duration_ms,
            t.explicit,
            t.popularity,
            a.spotify_album_id,
            a.name AS album_name,
            a.album_type,
            a.image_url,
            ar.spotify_artist_id,
            ar.name AS artist_name,
            ta.artist_order
        FROM tracks AS t
        JOIN albums AS a
            ON t.album_id = a.id
        JOIN track_artists AS ta
            ON t.id = ta.track_id
        JOIN artists AS ar
            ON ta.artist_id = ar.id
        WHERE t.spotify_track_id = $1
        ORDER BY ta.artist_order ASC;
    `;

    const result = await pool.query<TrackRow>(sql, [spotifyTrackId]);
    const trackRow = result.rows[0];

    if (!trackRow) {
        return null;
    }

    const track: SpotifyTrack = {
        spotifyTrackId: trackRow.spotify_track_id,
        name: trackRow.name,
        artists: result.rows.map((row) => ({
            id: row.spotify_artist_id,
            name: row.artist_name,
        })),
        album: {
            id: trackRow.spotify_album_id,
            name: trackRow.album_name,
            albumType: trackRow.album_type,
            imageUrl: trackRow.image_url,
        },
        spotifyUrl: trackRow.spotify_url,
        durationMs: trackRow.duration_ms,
        explicit: trackRow.explicit,
        popularity: trackRow.popularity,
    };

    return track;
}

export async function saveTrack(input: SpotifyTrack): Promise<SpotifyTrack> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Insert album
        const albumSql = `
            INSERT INTO albums (spotify_album_id, name, album_type, image_url)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (spotify_album_id) DO NOTHING
            RETURNING id;
        `;
        const albumResult = await client.query<{ id: number }>(albumSql, [
            input.album.id,
            input.album.name,
            input.album.albumType,
            input.album.imageUrl,
        ]);

        let albumId = albumResult.rows[0]?.id;

        if (albumId === undefined) {
            const selectAlbumSql = `
                SELECT id FROM albums WHERE spotify_album_id = $1;
            `;
            const selectAlbumResult = await client.query<{ id: number }>(
                selectAlbumSql,
                [input.album.id]
            );
            const albumRow = selectAlbumResult.rows[0];

            if (!albumRow) {
                throw new Error(
                    `Failed to retrieve album ID for Spotify album ID: ${input.album.id}`
                );
            }

            albumId = albumRow.id;
        }

        // Insert artists
        const artistIds: number[] = [];
        for (const artist of input.artists) {
            const artistSql = `
                INSERT INTO artists (spotify_artist_id, name)
                VALUES ($1, $2)
                ON CONFLICT (spotify_artist_id) DO NOTHING
                RETURNING id;
            `;
            const artistResult = await client.query<{ id: number }>(artistSql, [
                artist.id,
                artist.name,
            ]);

            let artistId = artistResult.rows[0]?.id;

            if (artistId === undefined) {
                const selectArtistSql = `
                    SELECT id FROM artists WHERE spotify_artist_id = $1;
                `;
                const selectArtistResult = await client.query<{ id: number }>(
                    selectArtistSql,
                    [artist.id]
                );
                const artistRow = selectArtistResult.rows[0];

                if (!artistRow) {
                    throw new Error(
                        `Failed to retrieve artist ID for Spotify artist ID: ${artist.id}`
                    );
                }

                artistId = artistRow.id;
            }

            artistIds.push(artistId);
        }

        // Insert track
        const trackSql = `
            INSERT INTO tracks (spotify_track_id, name, spotify_url, duration_ms, explicit, popularity, album_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (spotify_track_id) DO NOTHING
            RETURNING id;
        `;
        const trackResult = await client.query<{ id: number }>(trackSql, [
            input.spotifyTrackId,
            input.name,
            input.spotifyUrl,
            input.durationMs,
            input.explicit,
            input.popularity,
            albumId,
        ]);

        let trackId = trackResult.rows[0]?.id;

        if (trackId === undefined) {
            const selectTrackSql = `
                SELECT id FROM tracks WHERE spotify_track_id = $1;
            `;
            const selectTrackResult = await client.query<{ id: number }>(
                selectTrackSql,
                [input.spotifyTrackId]
            );
            const trackRow = selectTrackResult.rows[0];

            if (!trackRow) {
                throw new Error(
                    `Failed to retrieve track ID for Spotify track ID: ${input.spotifyTrackId}`
                );
            }

            trackId = trackRow.id;
        }

        // Insert track_artists relationships
        for (let i = 0; i < artistIds.length; i++) {
            const artistId = artistIds[i];

            if (artistId === undefined) {
                throw new Error(`Missing artist ID at index ${i}`);
            }

            const trackArtistSql = `
                INSERT INTO track_artists (track_id, artist_id, artist_order)
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING;
            `;

            await client.query(trackArtistSql, [trackId, artistId, i]);
        }

        await client.query("COMMIT");
        return input;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
