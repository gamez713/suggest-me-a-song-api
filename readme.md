# 🎵 Suggest Me a Song API

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Spotify](https://img.shields.io/badge/Spotify_Web_API-1DB954?logo=spotify&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![SuperTest](https://img.shields.io/badge/SuperTest-Testing-blue)
![Render](https://img.shields.io/badge/Render-000000?logo=render&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E599?logo=neon&logoColor=black)

## Overview

Suggest Me a Song is a REST API for searching Spotify tracks, submitting and managing song suggestions, and adding approved tracks to a public Spotify playlist.

Built with TypeScript, Node.js, Express, and PostgreSQL, the project integrates with the Spotify Web API using OAuth 2.0. It demonstrates layered backend architecture, normalized relational data modeling, transactional persistence, and automated integration testing.

## Live Deployment

**API URL:** https://suggest-me-a-song-api.onrender.com

The API is deployed on Render with a managed PostgreSQL database hosted on Neon.

Spotify OAuth refresh tokens are encrypted before being stored in PostgreSQL, allowing authentication to persist across server restarts.

The deployed API includes admin API-key authentication, IP-based rate limiting, HTTP security headers using Helmet, and JSON request-size limits.

**Note:** The Render Free instance may take additional time to respond after periods of inactivity.

## Architecture

```text
Routes → Controllers → Services → Repositories → PostgreSQL
```

The Spotify service provides a separate integration boundary between the application and the Spotify Web API.

- **Routes** define API endpoints and map requests to controllers.
- **Controllers** handle HTTP concerns including request validation and responses.
- **Services** contain application business logic and coordinate repositories and external services.
- **Repositories** isolate persistence and data-access operations.
- **Spotify Service** handles OAuth, track lookup, track search, and playlist operations.
- **PostgreSQL** stores normalized Track, Album, Artist, and Suggestion data, enforcing relationships through foreign keys and database constraints.

## Database Design

The application uses a normalized PostgreSQL database consisting of five tables:

- **artists** — Stores Spotify artist identifiers and names.
- **albums** — Stores album metadata, including album type and artwork.
- **tracks** — Stores Spotify track metadata and references its associated album.
- **track_artists** — Models the many-to-many relationship between tracks and artists while preserving artist order.
- **suggestions** — Stores submitted song suggestions, their status, and creation timestamps.
- **spotify_auth** — Stores encrypted Spotify refresh tokens and associated authentication data.

Tracks are stored independently of suggestions, allowing multiple suggestions to reference the same Spotify track without duplicating its metadata.

Track persistence uses PostgreSQL transactions to ensure related album, artist, and track records are saved consistently. Unique constraints and conflict handling prevent duplicate Spotify records.

[View ER Diagram](db/er-diagram.md)

## Features

- Search Spotify tracks and retrieve track metadata through the Spotify Web API
- Submit, retrieve, and manage song suggestions using Spotify track IDs
- Store normalized track, album, and artist data while preventing duplicate records
- Approve or reject suggestions and add approved tracks to a public Spotify playlist
- Spotify OAuth 2.0 with encrypted refresh-token storage and automatic access-token refresh
- Admin API-key authentication for protected endpoints
- IP-based rate limiting, Helmet security headers, and JSON request-size limits
- Request validation and centralized error handling
- Failure handling that keeps suggestions pending if Spotify playlist approval fails
- Automated integration testing with a dedicated PostgreSQL test database and mocked Spotify dependencies

## API Endpoints

### Suggestions

| Method | Endpoint           | Description                 | Auth   |
| ------ | ------------------ | --------------------------- | ------ |
| GET    | `/suggestions`     | Retrieve all suggestions    | Public |
| GET    | `/suggestions/:id` | Retrieve a suggestion by ID | Public |
| POST   | `/suggestions`     | Create a suggestion         | Public |
| PATCH  | `/suggestions/:id` | Update suggestion status    | Admin  |
| DELETE | `/suggestions/:id` | Delete a suggestion         | Admin  |

### Spotify

| Method | Endpoint                    | Description                       | Auth    |
| ------ | --------------------------- | --------------------------------- | ------- |
| GET    | `/spotify/login`            | Begin Spotify authorization       | Admin   |
| GET    | `/spotify/callback`         | Handle the Spotify OAuth callback | Public* |
| GET    | `/spotify/search?q={query}` | Search for Spotify tracks         | Public  |
| GET    | `/spotify/track/:trackId`   | Retrieve Spotify track metadata   | Publuc  |

**Authentication:** Admin-protected endpoints require an `x-admin-key` request header containing the configured `ADMIN_API_KEY`.

_The Spotify OAuth callback is publicly accessible but validates the authorization state to protect against unauthorized callback requests._

## Getting Started (Local Development)

### Prerequisites

- Node.js and npm
- PostgreSQL
- Spotify Developer application credentials

### Installation

Install dependencies:

```bash
npm install
```

### Database Setup

Create the development and test databases:

```bash
createdb suggest_me_a_song
createdb suggest_me_a_song_test
```

Initialize both databases using the provided schema:

```bash
psql -d suggest_me_a_song -f db/schema.sql
psql -d suggest_me_a_song_test -f db/schema.sql
```

These commands assume PostgreSQL is running and your local PostgreSQL user has the necessary permissions.

### Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure `.env` with:

- PostgreSQL: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`
- Spotify: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`, and `SPOTIFY_PLAYLIST_ID`
- `ADMIN_API_KEY` for protected administrative endpoints
- `TOKEN_ENCRYPTION_KEY` for encrypting stored Spotify refresh tokens (64 hexadecimal characters)

For hosted PostgreSQL environments, the application also supports `DATABASE_URL` as an alternative to individual connection settings. When provided, `DATABASE_URL` takes precedence.

Ensure `SPOTIFY_REDIRECT_URI` matches the redirect URI configured in your Spotify Developer Dashboard.

### Start the Development Server

```bash
npm run dev
```

### Spotify Authorization

Spotify authorization is required before accessing endpoints that use the Spotify API.

Request an authorization URL using your admin API key:

```bash
curl http://localhost:3000/spotify/login \
  -H "x-admin-key: YOUR_ADMIN_API_KEY"
```

Open the returned authorizeUrl in your browser and approve the requested Spotify permissions.

After successful authorization, the refresh token is encrypted and stored in PostgreSQL.

Access tokens are refreshed automatically, allowing authentication to persist across server restarts.

## Creating and Approving Suggestions

A suggestion references a Spotify track rather than storing user-provided song metadata.

Example request to POST /suggestions::

```json
{
    "spotifyTrackId": "4bQ7mjty0UVlKRalhizpGT",
    "message": "You should add this"
}
```

When a suggestion is created, the service first checks the local Track repository. If the track has not already been stored, its metadata is retrieved from Spotify and persisted before the suggestion is created.

New suggestions begin with a `pending` status.

Updating a suggestion to approved through the admin-protected PATCH /suggestions/:id endpoint adds its associated Spotify track to the configured public Spotify playlist.

The Spotify operation occurs before the local suggestion is marked as approved. If the Spotify request fails, the error is propagated and the suggestion remains pending.

## Running Tests

The project uses Vitest and SuperTest for integration testing.

The test suite exercises the Express request flow through routes, controllers, services, and PostgreSQL repositories while mocking Spotify API dependencies.

Tests run against a dedicated suggest_me_a_song_test PostgreSQL database. Database tables are reset between tests to ensure isolation and prevent interference with development data.

Create the test database and initialize it using db/schema.sql before running the suite.

Run all integration tests:

```bash
npx vitest run
```

The current suite contains 40 integration tests covering suggestion creation, retrieval, status updates, deletion, validation, admin authentication, Spotify OAuth, and failure handling.

## Planned Improvements

- Build a React frontend for searching Spotify tracks and submitting song suggestions.
- Integrate the frontend with the deployed API.
