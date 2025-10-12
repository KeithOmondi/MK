import express from "express";
import {
  createDispute,
  getUserDisputes,
  getAllDisputes,
  updateDisputeStatus,
  deleteDispute,
} from "../controller/disputeController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ------------------- USER ROUTES ------------------- */

// Create a dispute (any authenticated User)
router.post("/create", isAuthenticated, createDispute);

// Get logged-in user's disputes
router.get("/my-disputes", isAuthenticated, getUserDisputes);

/* ------------------- ADMIN ROUTES ------------------- */

// Get all disputes (Admin only)
router.get("/get", isAuthenticated, isAuthorized("Admin"), getAllDisputes);

// Update dispute status (Admin only)
router.put(
  "/update/:id/status",
  isAuthenticated,
  isAuthorized("Admin"),
  updateDisputeStatus
);

// Delete a dispute (Admin only - optional)
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteDispute
);

export default router;
