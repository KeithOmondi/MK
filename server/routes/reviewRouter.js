import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  addReview,
  getReviewsByProduct,
  getReviewsByUser,
  updateReview,
  deleteReview,
} from "../controller/reviewController.js";

const router = express.Router();

/* ================================
   Review Routes
================================ */

// Add a new review (authenticated users only)
router.post("/add", isAuthenticated, addReview);

// Get reviews for a product (public)
router.get("/product/:id", getReviewsByProduct);

// Get reviews by a user (authenticated, only for their own reviews)
router.get("/user/:id", isAuthenticated, getReviewsByUser);

// Update a review (authenticated, author only)
router.put("/update/:id", isAuthenticated, updateReview);

// Delete a review (authenticated, author/admin only)
router.delete("/delete/:id", isAuthenticated, deleteReview);

export default router;
