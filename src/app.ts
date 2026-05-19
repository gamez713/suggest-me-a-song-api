import express from "express";
import suggestionsRoutes from "./routes/suggestions.routes.js";

const app = express();

// Middleware
app.use(express.json());

// Temp route to check if API is running
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

// Routes
app.use("/suggestions", suggestionsRoutes);

export default app;