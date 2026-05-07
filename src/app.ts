import express from "express";
import suggestionsRoutes from "./routes/suggestions.routes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

app.use("/suggestions", suggestionsRoutes);

export default app;