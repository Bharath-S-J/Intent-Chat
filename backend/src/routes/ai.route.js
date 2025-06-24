import express from "express";
import { getSmartReplies, detectTone } from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/smart-reply", getSmartReplies);

export default router;
