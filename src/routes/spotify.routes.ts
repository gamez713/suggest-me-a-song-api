import { Router } from "express";
import {
  loginHandler,
  callbackHandler,
} from "../controllers/spotify.controller.js";

const router = Router();

router.get("/login", loginHandler);
router.get("/callback", callbackHandler);

export default router;