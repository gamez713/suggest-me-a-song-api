import app from "../src/app.js";
import request from "supertest";
import { describe, it, expect} from "vitest";

describe("POST /suggestions", () => {
    it("creates a new suggestion", async () => {
        const response = await request(app).post("/suggestions").send({
            title: "Test Song",
            artist: "Test Artist",
            message: "This is a test suggestion"
        });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("title", "Test Song");
        expect(response.body).toHaveProperty("artist", "Test Artist");
        expect(response.body).toHaveProperty("message", "This is a test suggestion");
        expect(response.body).toHaveProperty("status", "pending");
    });

    // Missing required fields
    it("returns 400 if artist is missing", async () => {
        const response = await request(app).post("/suggestions").send({
            title: "Test Song"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Title and artist are required");
    });
    it("returns 400 if title is missing", async () => {
        const response = await request(app).post("/suggestions").send({
            artist: "Test Artist"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Title and artist are required");
    });

    // Type validation
    it("returns 400 if artist is not a string", async () => {
        const response = await request(app).post("/suggestions").send({
            artist: 123,
            title: "Test Song"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Title and artist must be strings");
    });
    it("returns 400 if title is not a string", async () => {
        const response = await request(app).post("/suggestions").send({
            artist: "Test Artist",
            title: 123
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Title and artist must be strings");
    });
    it("returns 400 if message is not a string", async () => {
        const response = await request(app).post("/suggestions").send({
            artist: "Test Artist",
            title: "Test Song",
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
    it("returns 400 if message exceeds maximum length", async ()=> {
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