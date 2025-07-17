import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessages
} from "../controller/message.controller.js";

const router = express.Router();

// ✅ More specific routes first
router.get("/users", protectRoute, getUsersForSidebar);
router.post("/send/:id", protectRoute, sendMessages);  // Moved up
router.get("/:id", protectRoute, getMessages);          // Least specific - put last

export default router;
