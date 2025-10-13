import express from "express";
import {
  createWallet,
  getMyWallet,
  depositFunds,
  withdrawFunds,
  getMyTransactions,
  getAllWallets,
} from "../controller/walletController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ============================================================
   USER ROUTES
============================================================ */

// Create wallet (auto on registration or manual trigger)
router.post("/create", isAuthenticated, createWallet);

// Get logged-in user's wallet
router.get("/me", isAuthenticated, getMyWallet);

// Deposit funds
router.post("/deposit", isAuthenticated, depositFunds);

// Withdraw funds
router.post("/withdraw", isAuthenticated, withdrawFunds);

// Get transaction history
router.get("/transactions", isAuthenticated, getMyTransactions);

/* ============================================================
   ADMIN ROUTES
============================================================ */

// Get all wallets (admin view)
router.get(
  "/admin/all",
 isAuthenticated,
  isAuthorized("Admin"),
  getAllWallets
);

export default router;
