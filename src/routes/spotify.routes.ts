import { Router } from "express";
import {
    loginHandler,
    callbackHandler,
    getTrackHandler,
    searchTracksHandler,
} from "../controllers/spotify.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.get("/login", requireAdmin, loginHandler);
router.get("/callback", callbackHandler);
router.get("/search", searchTracksHandler);
router.get("/track/:trackId", getTrackHandler);

export default router;
