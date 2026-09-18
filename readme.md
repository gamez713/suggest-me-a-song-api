# 🎵 Suggest Me a Song API

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![SuperTest](https://img.shields.io/badge/SuperTest-Testing-blue)
![Spotify](https://img.shields.io/badge/Spotify_Web_API-1DB954?logo=spotify&logoColor=white)

## Overview

Suggest Me a Song is a REST API for searching Spotify tracks, submitting and reviewing song suggestions, and adding approved tracks to a public Spotify playlist.

Built with TypeScript, Node.js, and Express, the project integrates with the Spotify Web API using OAuth 2.0 and demonstrates layered backend architecture, external API integration, request validation, centralized error handling, and integration testing.

## Architecture

```text
Routes → Controllers → Services → Repositories → JSON Storage
```

The Spotify service provides a separate integration boundary between the application and the Spotify Web API.

- **Routes** define API endpoints and map requests to controllers.
- **Controllers** handle HTTP concerns including request validation and responses.
- **Services** contain application business logic and coordinate repositories and external services.
- **Repositories** isolate persistence and data-access operations.
- **Spotify Service** handles OAuth, track lookup, track search, and playlist operations.
- **JSON Storage** currently persists Track and Suggestion data between application restarts.

The application models Tracks and Suggestions separately. A Track represents Spotify metadata identified by a Spotify track ID, while a Suggestion represents a recommendation submitted to the application. Multiple suggestions can reference the same Track.

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
- Integration tests with isolated test persistence
- Mocked Spotify dependencies for deterministic testing
- Failure handling that keeps a suggestion pending if Spotify playlist approval fails

## API Endpoints

### Suggestions

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/suggestions` | Retrieve all suggestions |
| GET | `/suggestions/:id` | Retrieve a suggestion by ID |
| POST | `/suggestions` | Create a suggestion |
| PATCH | `/suggestions/:id` | Update suggestion status |
| DELETE | `/suggestions/:id` | Delete a suggestion |

### Spotify

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/spotify/login` | Begin Spotify authorization |
| GET | `/spotify/callback` | Handle the Spotify OAuth callback |
| GET | `/spotify/search?q={query}` | Search for Spotify tracks |
| GET | `/spotify/track/:trackId` | Retrieve Spotify track metadata |

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file with the required Spotify configuration:

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=your_redirect_uri
SPOTIFY_PLAYLIST_ID=your_playlist_id
```

Start the development server:

```bash
npm run dev
```

Authorize the application with Spotify by visiting:

```text
http://localhost:3000/spotify/login
```

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

The test suite exercises the Express request flow through routes, controllers, services, and repositories while mocking Spotify API dependencies. Test data is stored separately from development data so tests can run independently without modifying application data.

Run the test suite:

```bash
npm test -- --run
```

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

- Application data is currently persisted in JSON files.
- Spotify OAuth tokens are currently stored in memory and are lost when the server restarts.
- Spotify access-token refresh is not yet automated.
- Approval endpoints do not yet have owner authentication.
- The project currently provides a backend API without a frontend interface.

## Planned Improvements

- Replace JSON persistence with PostgreSQL
- Add a React frontend for searching and submitting songs
- Add authentication for administrative approval actions
- Improve Spotify token persistence and refresh handling
- Deploy the full-stack application