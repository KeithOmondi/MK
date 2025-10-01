// routes/authRoutes.js
import express from "express";
import {
  //changePassword,
  forgotPassword,
  getUser,
  login,
  logout,
  refreshToken,   // ✅ NEW
  register,
  resendOTP,
  resetPassword,
  updatePassword,
  verifyOTP,
} from "../controller/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { registerValidation, validateRequest } from "../middlewares/authValidator.js";

const router = express.Router();

/* ================================
   Auth Routes
================================ */
router.post("/register", registerValidation, validateRequest, register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);

// ✅ New Refresh Token endpoint
router.post("/refresh-token", refreshToken);

router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.put("/password/update", isAuthenticated, updatePassword);
//router.put("/change-password", isAuthenticated, changePassword);

router.post("/otp/resend", resendOTP);

export default router;
