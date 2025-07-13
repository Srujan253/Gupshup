import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar,getMessages ,sendMessages } from "../controller/message.controller.js";

const router = express.Router();

router.get("/users",protectRoute,getUsersForSidebar); // For Users to Show in Sidebar
router.get("/:id",protectRoute,getMessages);// For Messages to Show in Chat Box
router.post("/send/:id",protectRoute,sendMessages); // For Messages to Send

export default router;
