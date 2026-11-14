import express from "express";
import suggestionsRoutes from "./routes/suggestion.routes.js";
import spotifyRoutes from "./routes/spotify.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { isIP } from "node:net";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import helmet from "helmet";

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => {
        const cfIp = req.headers["cf-connecting-ip"];

        const ip =
            typeof cfIp === "string" && isIP(cfIp)
                ? cfIp
                : req.socket.remoteAddress || "unknown";

        return ipKeyGenerator(ip, 56);
    },
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(express.json({ limit: "10kb" }));

// Routes
app.use("/suggestions", suggestionsRoutes);
app.use("/spotify", spotifyRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
