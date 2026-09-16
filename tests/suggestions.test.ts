import app from "../src/app.js";
import request from "supertest";
import { describe, it, expect, vi } from "vitest";

vi.mock("../src/services/spotify.service.js", () => ({
    getSpotifyTrack: vi.fn().mockResolvedValue({
        spotifyTrackId: "test-track-id",
        name: "Test Song",
        artists: [
            {
                id: "test-artist-id",
                name: "Test Artist",
            },
        ],
        album: {
            id: "test-album-id",
            name: "Test Album",
            imageUrl: null,
        },
        spotifyUrl: "https://open.spotify.com/track/test-track-id",
        durationMs: 200000,
        explicit: false,
        popularity: 50,
    }),
}));

describe("POST /suggestions", () => {
    it("creates a new suggestion", async () => {
        const response = await request(app).post("/suggestions").send({
            spotifyTrackId: "test-track-id",
            message: "This is a test suggestion for POST endpoint"
        });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("spotifyTrackId", "test-track-id");
        expect(response.body).toHaveProperty("message", "This is a test suggestion for POST endpoint");
        expect(response.body).toHaveProperty("status", "pending");
        expect(response.body).toHaveProperty("createdAt");
    });

    // Missing required fields
    it("returns 400 if spotifyTrackId is missing", async () => {
        const response = await request(app).post("/suggestions").send({
            message: "This is a test suggestion for POST endpoint"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Spotify track ID is required");
    });

    // Type validation
    it("returns 400 if spotifyTrackId is not a string", async () => {
        const response = await request(app).post("/suggestions").send({
            spotifyTrackId: 123,
            message: "This is a test suggestion for POST endpoint"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Spotify track ID must be a string");
    });
    it("returns 400 if message is not a string", async () => {
        const response = await request(app).post("/suggestions").send({
            spotifyTrackId: "test-track-id",
            message: 123
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Message must be a string");
    });

    // Empty string validation
    it("returns 400 if spotifyTrackId is an empty string", async () => {
        const response = await request(app).post("/suggestions").send({
            spotifyTrackId: " ",
            message: "This is a test suggestion for POST endpoint"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Spotify track ID cannot be empty");
    });

    // Length validation
    it("returns 400 if message exceeds maximum length", async () => {
        const longMessage = "A".repeat(501);
        const response = await request(app).post("/suggestions").send({
            spotifyTrackId: "test-track-id",
            message: longMessage
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Message exceeds maximum length");
    })

    // Optional field validation
    it("creates a new suggestion without a message", async () => {
    const response = await request(app).post("/suggestions").send({
        spotifyTrackId: "test-track-id"
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("spotifyTrackId", "test-track-id");
    expect(response.body).toHaveProperty("status", "pending");
    expect(response.body).toHaveProperty("createdAt");
    expect(response.body).not.toHaveProperty("message");
});
});

describe("GET /suggestions", () => {
    it("returns an array of suggestions", async () => {
        // Create a new suggestion to test on
        const createResponse = await request(app).post("/suggestions").send({
            spotifyTrackId: "test-track-id",
            message: "This is a test suggestion for GET endpoint"
        });

        const suggestionId = createResponse.body.id;

        const response = await request(app).get("/suggestions");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty("id", suggestionId);
        expect(response.body[0]).toHaveProperty("spotifyTrackId", "test-track-id");
    });
});

describe("GET /suggestions/:id", () => {
    it("returns a suggestion by id", async () => {
        // Create a new suggestion to test on
        const createResponse = await request(app).post("/suggestions").send({
            spotifyTrackId: "test-track-id",
            message: "This is a test suggestion for GET endpoint"
        });

        const suggestionId = createResponse.body.id;
        const response = await request(app).get(`/suggestions/${suggestionId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id", suggestionId);
    });

    it("returns 404 if suggestion not found", async () => {
        const response = await request(app).get("/suggestions/9999");
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error", "Suggestion not found");
    });
});

describe("PATCH /suggestions/:id", () => {
    it("updates suggestion status", async () => {
        // Create a new suggestion to test on
        const createResponse = await request(app).post("/suggestions").send({
            spotifyTrackId: "test-track-id",
            message: "This is a test suggestion for PATCH endpoint"
        });

        const suggestionId = createResponse.body.id;

        // Update status to "approved"
        const response = await request(app).patch("/suggestions/" + suggestionId).send({
            status: "approved"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id", suggestionId);
        expect(response.body).toHaveProperty("status", "approved");
    });

    it("returns 400 if parameter id is invalid", async () => {
        const response = await request(app).patch("/suggestions/notANumber").send({
            status: "approved"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Invalid id parameter");
    });

    it("returns 400 if status value is invalid", async () => {  
        const response = await request(app).patch("/suggestions/1").send({
            status: "invalidStatus"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Invalid status value");
    });

    it("returns 400 if status value is missing", async () => {
        const response = await request(app).patch("/suggestions/1").send({});
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Invalid status value");  
    });

    it("returns 404 if suggestion not found", async () => {
        const response = await request(app).patch("/suggestions/9999").send({
            status: "approved"
        });
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error", "Suggestion not found");
    });
});

describe("DELETE /suggestions/:id", () => {
    it("deletes a suggestion", async () => {
        // Create a new suggestion to test on
        const createResponse = await request(app).post("/suggestions").send({
            spotifyTrackId: "test-track-id",
            message: "This is a test suggestion for DELETE endpoint"
        });

        const suggestionId = createResponse.body.id;

        // Delete the suggestion
        const response = await request(app).delete("/suggestions/" + suggestionId);
        expect(response.status).toBe(204);
    });

    it("returns 400 if parameter id is invalid", async () => {
        const response = await request(app).delete("/suggestions/notANumber");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Invalid id parameter");
    });

    it("returns 404 if suggestion not found", async () => {
        const response = await request(app).delete("/suggestions/9999");
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error", "Suggestion not found");
    });
});