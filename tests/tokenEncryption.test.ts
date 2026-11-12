import { describe, expect, it } from "vitest";
import { encryptToken, decryptToken } from "../src/utils/tokenEncryption.js";

describe("Token encryption", () => {
    it("encrypts and decrypts a token correctly", () => {
        const originalToken = "test_spotify_refresh_token";

        const encryptedToken = encryptToken(originalToken);
        const decryptedToken = decryptToken(encryptedToken);

        expect(encryptedToken).not.toBe(originalToken);
        expect(decryptedToken).toBe(originalToken);
    });

    it("produces different ciphertexts for the same token", () => {
        const token = "test_spotify_refresh_token";

        const first = encryptToken(token);
        const second = encryptToken(token);

        expect(first).not.toBe(second);
    });

    it("rejects a tampered encrypted token", () => {
        const encryptedToken = encryptToken("test_spotify_refresh_token");

        const parts = encryptedToken.split(":");
        const ciphertext = parts[2]!;

        parts[2] = (ciphertext[0] === "a" ? "b" : "a") + ciphertext.slice(1);

        expect(() => decryptToken(parts.join(":"))).toThrow();
    });
});
