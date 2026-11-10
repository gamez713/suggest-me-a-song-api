import type { Request, Response, NextFunction } from "express";
import { createHash, timingSafeEqual } from "node:crypto";

function hashKey(key: string): Buffer {
    return createHash("sha256").update(key).digest();
}

export function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const providedKey = req.get("x-admin-key");
    const expectedKey = process.env.ADMIN_API_KEY;

    if (!providedKey || !expectedKey) {
       res.status(401).json({ error: "Unauthorized" });
       return;
    }

    const expectedKeyHash = hashKey(expectedKey);
    const providedKeyHash = hashKey(providedKey);

    if (!timingSafeEqual(expectedKeyHash, providedKeyHash)) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    next();
}
