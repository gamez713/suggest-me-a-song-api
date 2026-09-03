import express from "express";
import suggestionsRoutes from "./routes/suggestions.routes.js";
import spotifyRoutes from "./routes/spotify.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/suggestions", suggestionsRoutes);
app.use("/spotify", spotifyRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;