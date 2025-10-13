// routes/paymentRoutes.js
import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import {
  initiateLipPay,
  lipPayCallback,
  getPaymentStatus,
  adminReleaseEscrow,
  initiateWalletDeposit,
  walletCallback,
  withdrawFunds,
} from "../controller/paymentController.js";

const router = express.Router();

/* ------------------------ ORDER PAYMENTS ------------------------ */
// Initiate payment → Buyer
router.post("/mpesa/pay", isAuthenticated, initiateLipPay);

// Callback from Safaricom
router.post("/mpesa/callback", lipPayCallback);

// Check payment status → Buyer polls this after STK push
router.get("/status/:orderId", isAuthenticated, getPaymentStatus);

/* ------------------------ ADMIN ESCROW RELEASE ------------------------ */
// Admin releases escrow for an order
router.post(
  "/admin/release/:orderId",
  isAuthenticated,
  isAuthorized("Admin"),
  adminReleaseEscrow
);

/* ------------------------ WALLET OPERATIONS ------------------------ */
// Initiate wallet deposit → Buyer
router.post("/wallet/deposit", isAuthenticated, initiateWalletDeposit);

// Callback from Safaricom for wallet deposit
router.post("/wallet/callback", walletCallback);

// Withdraw funds from wallet → Buyer
router.post("/wallet/withdraw", isAuthenticated, withdrawFunds);

export default router;
