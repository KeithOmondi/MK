import express from "express";
import {
  changePassword,
  forgotPassword,
  getUser,
  login,
  logout,
  register,
  resetPassword,
  updatePassword,
  verifyOTP,
} from "../controller/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { registerValidation, validateRequest } from "../middlewares/authValidator.js";

const router = express.Router();

router.post("/register", register, registerValidation, validateRequest);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.put("/password/update", isAuthenticated, updatePassword);
router.put("/change-password", isAuthenticated, changePassword);

export default router;
