import { Router } from "express";
import {
    createSuggestionHandler,
    getAllSuggestionsHandler,
    getSuggestionByIdHandler,
    updateSuggestionStatusHandler,
    deleteSuggestionHandler,
} from "../controllers/suggestion.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.post("/", createSuggestionHandler);
router.get("/", getAllSuggestionsHandler);
router.get("/:id", getSuggestionByIdHandler);
router.patch("/:id", requireAdmin, updateSuggestionStatusHandler);
router.delete("/:id", requireAdmin, deleteSuggestionHandler);

export default router;
