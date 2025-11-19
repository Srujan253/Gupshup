import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  saveChatMessage,
  getChatHistory,
  deleteChatHistory,
  deleteChatMessage,
  getChatStats,
} from "../controller/gemini.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Save a chat message (user or assistant)
router.post("/save", saveChatMessage);

// Get chat history for authenticated user
router.get("/history", getChatHistory);

// Get chat statistics
router.get("/stats", getChatStats);

// Delete entire chat history
router.delete("/history", deleteChatHistory);

// Delete a specific message
router.delete("/message/:messageId", deleteChatMessage);

export default router;
