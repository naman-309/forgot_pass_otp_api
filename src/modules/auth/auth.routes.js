import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    verifyOtp,
    resetPassword
} from "./auth.controller.js";
import { verifyAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

// 1. Register User API
router.post("/register", registerUser);

// 2. Login User API
router.post("/login", loginUser);

// 3. Logout API (Protected)
router.post("/logout", verifyAuth, logoutUser);

// 4. Forgot Password API (Sends OTP)
router.post("/forgot-password", forgotPassword);

// 5. Verify OTP API (Sets short-lived reset token cookie)
router.post("/verify-otp", verifyOtp);

// 6. Reset Password API (Uses reset token cookie to update password)
router.post("/reset-password", resetPassword);


export default router;