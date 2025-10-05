import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  registerNewAdmin,
  fetchUserProfile,
  updateUserProfile,
} from "../controller/userController.js";

const router = express.Router();

// ✅ Get all users
router.get("/all", isAuthenticated, isAuthorized("Admin"), getAllUsers);

// ✅ Get single user by ID
router.get("/get/:id", isAuthenticated, isAuthorized("Admin"), getUserById);

// ✅ Update user by ID
router.put("/update/:id", isAuthenticated, isAuthorized("Admin"), updateUser);

// ✅ Delete user by ID
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteUser);

// ✅ Register a new Admin
router.post("/admins", isAuthenticated, isAuthorized("Admin"), registerNewAdmin);

// Get logged-in user's profile
router.get("/profile", isAuthenticated, fetchUserProfile);

// Update logged-in user's profile
router.put("/profile", isAuthenticated, updateUserProfile);

export default router;
