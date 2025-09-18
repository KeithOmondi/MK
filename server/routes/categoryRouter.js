import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controller/categoryController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Create category → Admin only
router.post("/create", isAuthenticated, isAuthorized("Admin"), createCategory);

// ✅ Get all categories → Public
router.get("/", getCategories);

// ✅ Get single category → Public
router.get("/:id", getCategoryById);

// ✅ Update category → Admin only
router.put("/:id", isAuthenticated, isAuthorized("Admin"), updateCategory);

// ✅ Delete category → Admin only
router.delete("/:id", isAuthenticated, isAuthorized("Admin"), deleteCategory);

export default router;
