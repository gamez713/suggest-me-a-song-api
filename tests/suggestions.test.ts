import app from "../src/app.js";
import request from "supertest";
import { describe, it, expect } from "vitest";

describe("POST /suggestions", () => {
    it("creates a new suggestion", async () => {
        const response = await request(app).post("/suggestions").send({
            title: "POST Test Song",
            artist: "POST Test Artist",
            message: "This is a test suggestion for POST endpoint"
        });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("title", "POST Test Song");
        expect(response.body).toHaveProperty("artist", "POST Test Artist");
        expect(response.body).toHaveProperty("message", "This is a test suggestion for POST endpoint");
        expect(response.body).toHaveProperty("status", "pending");
    });

    // Missing required fields
    it("returns 400 if artist is missing", async () => {
        const response = await request(app).post("/suggestions").send({
            title: "POST Test Song"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Title and artist are required");
    });
    it("returns 400 if title is missing", async () => {
        const response = await request(app).post("/suggestions").send({
            artist: "POST Test Artist"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Title and artist are required");
    });

    // Type validation
    it("returns 400 if artist is not a string", async () => {
        const response = await request(app).post("/suggestions").send({
            artist: 123,
            title: "POST Test Song"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Title and artist must be strings");
    });
    it("returns 400 if title is not a string", async () => {
        const response = await request(app).post("/suggestions").send({
            artist: "POST Test Artist",
            title: 123
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Title and artist must be strings");
    });
    it("returns 400 if message is not a string", async () => {
        const response = await request(app).post("/suggestions").send({
            artist: "POST Test Artist",
            title: "POST Test Song",
            message: 123
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Message must be a string");
    });

    // Empty string validation
    it("returns 400 if artist is an empty string", async () => {
        const response = await request(app).post("/suggestions").send({
            artist: " ",
            title: "Test Song"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Title and artist cannot be empty");
    });
    it("returns 400 if title is an empty string", async () => {
        const response = await request(app).post("/suggestions").send({
            artist: "Test Artist",
            title: " "
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Title and artist cannot be empty");
    });

    // Length validation
    it("returns 400 if artist exceeds maximum length", async () => {
        const longArtist = "A".repeat(101);
        const response = await request(app).post("/suggestions").send({
            artist: longArtist,
            title: "Test Song"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Title and artist exceed maximum length");
    });
    it("returns 400 if  title exceeds maximum length", async () => {
        const longTitle = "A".repeat(101);
        const response = await request(app).post("/suggestions").send({
            artist: "Test Artist",
            title: longTitle
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Title and artist exceed maximum length");
    });
    it("returns 400 if message exceeds maximum length", async () => {
        const longMessage = "A".repeat(501);
        const response = await request(app).post("/suggestions").send({
            artist: "Test Artist",
            title: "Test Song",
            message: longMessage
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Message exceeds maximum length");
    })
});

describe("GET /suggestions", () => {
    it("returns an array of suggestions", async () => {
        const response = await request(app).get("/suggestions");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});

describe("GET /suggestions/:id", () => {
    it("returns a suggestion by id", async () => {
        const response = await request(app).get("/suggestions/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id", 1);
    });

    it("returns 404 if suggestion not found", async () => {
        const response = await request(app).get("/suggestions/9999");
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error", "Suggestion not found");
    });
});

describe("PATCH /suggestions/:id/status", () => {
    it("updates suggestion status", async () => {
        // Create a new suggestion to test on
        const createResponse = await request(app).post("/suggestions").send({
            title: "PATCH Test Song",
            artist: "PATCH Test Artist"
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
            title: "Delete Test Song",
            artist: "Delete Test Artist"
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