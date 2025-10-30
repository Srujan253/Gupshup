import express from "express";
import { 
  login, 
  logout, 
  signup, 
  updateProfile, 
  updateUsername,
  checkAuth, 
  sendOTP, 
  verifyOTPAndCreateAccount, 
  resendOTP 
} from "../controller/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// OTP-based signup routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTPAndCreateAccount);
router.post("/resend-otp", resendOTP);

// Original routes (keep signup for backward compatibility)
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/update-username", protectRoute, updateUsername);
router.get("/check", protectRoute, checkAuth);

export default router;
