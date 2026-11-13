import express from "express";
import suggestionsRoutes from "./routes/suggestion.routes.js";
import spotifyRoutes from "./routes/spotify.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { rateLimit } from "express-rate-limit";

const app = express();

app.set("trust proxy", 1);

// Middleware
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
}));

app.use(express.json());

// Debug route for production environment
app.get("/debug/ip", (req, res) => {
    console.log({
        resolvedIp: req.ip,
        socketIp: req.socket.remoteAddress,
        forwardedFor: req.headers["x-forwarded-for"],
    });

    res.sendStatus(204);
});

// Routes
app.use("/suggestions", suggestionsRoutes);
app.use("/spotify", spotifyRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
