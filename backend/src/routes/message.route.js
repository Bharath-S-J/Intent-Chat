import express from "express";
import multer from "multer";

import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

const upload = multer();


router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, upload.single("image"), sendMessage);

export default router;
