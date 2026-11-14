# 🎵 Suggest Me a Song API

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![SuperTest](https://img.shields.io/badge/SuperTest-Testing-blue)
![Spotify](https://img.shields.io/badge/Spotify_Web_API-1DB954?logo=spotify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

## Overview

Suggest Me a Song is a REST API for searching Spotify tracks, submitting and reviewing song suggestions, and adding approved tracks to a public Spotify playlist.

Built with TypeScript, Node.js, Express, and PostgreSQL, the project integrates with the Spotify Web API using OAuth 2.0. It demonstrates layered backend architecture, normalized relational data modeling, transactional persistence, and automated integration testing.

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

The application models Tracks and Suggestions separately. A Track represents Spotify metadata identified by a Spotify track ID, while a Suggestion represents a recommendation submitted to the application. Multiple suggestions can reference the same Track.

## Database Design

The application uses a normalized PostgreSQL database consisting of five tables:

- **artists** — Stores Spotify artist identifiers and names.
- **albums** — Stores album metadata, including album type and artwork.
- **tracks** — Stores Spotify track metadata and references its associated album.
- **track_artists** — Models the many-to-many relationship between tracks and artists while preserving artist order.
- **suggestions** — Stores submitted song suggestions, their status, and creation timestamps.

Tracks are stored independently of suggestions, allowing multiple suggestions to reference the same Spotify track without duplicating its metadata.

Track persistence uses PostgreSQL transactions to ensure related album, artist, and track records are saved consistently. Unique constraints and conflict handling prevent duplicate Spotify records.

## Features

- Search for tracks using the Spotify Web API
- Retrieve Spotify track metadata
- Submit song suggestions using Spotify track IDs
- Store normalized Spotify track metadata
- Avoid duplicate Track records while allowing multiple suggestions for the same song
- Retrieve all song suggestions
- Retrieve individual suggestions by ID
- Approve or reject suggestions
- Add approved tracks to a public Spotify playlist
- OAuth 2.0 authorization with Spotify
- Request validation and centralized error handling
- Integration tests using a dedicated PostgreSQL test database
- Mocked Spotify dependencies for deterministic testing
- Failure handling that keeps a suggestion pending if Spotify playlist approval fails

## API Endpoints

### Suggestions

| Method | Endpoint           | Description                 |
| ------ | ------------------ | --------------------------- |
| GET    | `/suggestions`     | Retrieve all suggestions    |
| GET    | `/suggestions/:id` | Retrieve a suggestion by ID |
| POST   | `/suggestions`     | Create a suggestion         |
| PATCH  | `/suggestions/:id` | Update suggestion status    |
| DELETE | `/suggestions/:id` | Delete a suggestion         |

### Spotify

| Method | Endpoint                    | Description                       |
| ------ | --------------------------- | --------------------------------- |
| GET    | `/spotify/login`            | Begin Spotify authorization       |
| GET    | `/spotify/callback`         | Handle the Spotify OAuth callback |
| GET    | `/spotify/search?q={query}` | Search for Spotify tracks         |
| GET    | `/spotify/track/:trackId`   | Retrieve Spotify track metadata   |

## Getting Started

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

- PostgreSQL connection settings
- Spotify client ID, client secret, playlist ID, and redirect URI
- ADMIN_API_KEY for protected administrative endpoints
- TOKEN_ENCRYPTION_KEY for encrypting stored Spotify refresh tokens (64 hexadecimal characters)

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

## Creating a Suggestion

A suggestion references a Spotify track rather than storing user-provided song metadata.

Example request:

```json
{
    "spotifyTrackId": "4bQ7mjty0UVlKRalhizpGT",
    "message": "You should add this"
}
```

When a suggestion is created, the service first checks the local Track repository. If the track has not already been stored, its metadata is retrieved from Spotify and persisted before the suggestion is created.

New suggestions begin with a `pending` status.

## Approving a Suggestion

Updating a suggestion to `approved` adds its associated Spotify track to the configured public Spotify playlist.

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

The current suite contains 19 integration tests covering suggestion creation, retrieval, status updates, deletion, validation, and Spotify failure handling.

## Code Formatting

The project uses Prettier for consistent code formatting.

Format the project:

```bash
npm run format
```

Check formatting without modifying files:

```bash
npm run format:check
```

## Current Limitations

- The project currently provides a backend API without a frontend interface.
- Administrative actions use API-key authentication rather than a dedicated user authentication system.
- Spotify OAuth authorization state is stored in memory, requiring a single application instance during authorization.
- The application has not yet been deployed.

## Planned Improvements

- Deploy the API with Render and PostgreSQL on Neon.
- Build a React frontend for searching and submitting songs.
- Integrate the frontend with the deployed API.
