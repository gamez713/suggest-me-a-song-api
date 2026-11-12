import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
    const keyHex = process.env.TOKEN_ENCRYPTION_KEY;

    if (!keyHex) {
        throw new Error("TOKEN_ENCRYPTION_KEY is not configured");
    }

    if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
        throw new Error(
            "TOKEN_ENCRYPTION_KEY must be a 32-byte hexadecimal key"
        );
    }

    return Buffer.from(keyHex, "hex");
}

export function encryptToken(token: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);

    const encrypted = Buffer.concat([
        cipher.update(token, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex"),
    ].join(":");
}

export function decryptToken(encryptedToken: string): string {
    const [ivHex, authTagHex, ciphertextHex] = encryptedToken.split(":");

    if (!ivHex || !authTagHex || !ciphertextHex) {
        throw new Error("Invalid encrypted token format");
    }

    const decipher = createDecipheriv(
        ALGORITHM,
        getEncryptionKey(),
        Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(ciphertextHex, "hex")),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}
