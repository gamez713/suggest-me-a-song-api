import { Router } from "express";
import {
    createSuggestionHandler,
    getAllSuggestionsHandler,
    getSuggestionByIdHandler,
    updateSuggestionStatusHandler,
    deleteSuggestionHandler,
} from "../controllers/suggestion.controller.js";

const router = Router();

router.post("/", createSuggestionHandler);
router.get("/", getAllSuggestionsHandler);
router.get("/:id", getSuggestionByIdHandler);
router.patch("/:id", updateSuggestionStatusHandler);
router.delete("/:id", deleteSuggestionHandler);

export default router;
