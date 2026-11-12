CREATE TABLE artists (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    spotify_artist_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE albums (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    spotify_album_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT,
    album_type TEXT NOT NULL
        CHECK (album_type IN ('album', 'single', 'compilation'))
);

CREATE TABLE tracks (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    spotify_track_id TEXT UNIQUE NOT NULL,
    album_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    spotify_url TEXT NOT NULL,
    duration_ms INTEGER NOT NULL
        CHECK (duration_ms >= 0),
    explicit BOOLEAN NOT NULL,
    popularity INTEGER NOT NULL
        CHECK (popularity BETWEEN 0 AND 100),

    FOREIGN KEY (album_id) REFERENCES albums(id)
);

CREATE TABLE track_artists (
    track_id INTEGER NOT NULL,
    artist_id INTEGER NOT NULL,
    artist_order INTEGER NOT NULL
        CHECK (artist_order >= 0),

    PRIMARY KEY (track_id, artist_id),
    UNIQUE (track_id, artist_order),

    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);

CREATE TABLE suggestions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    track_id INTEGER NOT NULL,
    message TEXT
        CHECK (char_length(message) <= 500),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (track_id) REFERENCES tracks(id)
);

CREATE TABLE spotify_auth (
    id INTEGER PRIMARY KEY DEFAULT 1
        CHECK (id = 1),
    encrypted_refresh_token TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
