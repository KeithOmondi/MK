import Wallet from "../models/Wallet.js";
import User from "../models/userModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";

/* ============================================================
   CREATE WALLET FOR USER
============================================================ */
export const createWallet = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  const existingWallet = await Wallet.findOne({ user: userId });
  if (existingWallet) {
    return next(new ErrorHandler("Wallet already exists", 400));
  }

  const wallet = await Wallet.create({
    user: userId,
    balance: 0,
    currency: "KES",
  });

  res.status(201).json({
    success: true,
    message: "Wallet created successfully",
    wallet,
  });
});

/* ============================================================
   GET USER WALLET
============================================================ */
export const getMyWallet = catchAsyncErrors(async (req, res, next) => {
  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    return next(new ErrorHandler("Wallet not found", 404));
  }

  res.status(200).json({ success: true, wallet });
});

/* ============================================================
   DEPOSIT FUNDS (e.g., after payment confirmation)
============================================================ */
export const depositFunds = catchAsyncErrors(async (req, res, next) => {
  const { amount, description, reference } = req.body;

  if (!amount || amount <= 0) {
    return next(new ErrorHandler("Invalid deposit amount", 400));
  }

  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    return next(new ErrorHandler("Wallet not found", 404));
  }

  wallet.balance += amount;
  wallet.transactions.push({
    type: "deposit",
    amount,
    description: description || "Deposit",
    reference,
    date: new Date(),
  });

  await wallet.save();

  res.status(200).json({
    success: true,
    message: "Deposit successful",
    wallet,
  });
});

/* ============================================================
   WITHDRAW FUNDS (user payout)
============================================================ */
export const withdrawFunds = catchAsyncErrors(async (req, res, next) => {
  const { amount, description, reference } = req.body;

  if (!amount || amount <= 0) {
    return next(new ErrorHandler("Invalid withdrawal amount", 400));
  }

  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    return next(new ErrorHandler("Wallet not found", 404));
  }

  if (wallet.balance < amount) {
    return next(new ErrorHandler("Insufficient funds", 400));
  }

  wallet.balance -= amount;
  wallet.transactions.push({
    type: "withdrawal",
    amount,
    description: description || "Withdrawal",
    reference,
    date: new Date(),
  });

  await wallet.save();

  res.status(200).json({
    success: true,
    message: "Withdrawal successful",
    wallet,
  });
});

/* ============================================================
   GET WALLET TRANSACTIONS
============================================================ */
export const getMyTransactions = catchAsyncErrors(async (req, res, next) => {
  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    return next(new ErrorHandler("Wallet not found", 404));
  }

  res.status(200).json({
    success: true,
    transactions: wallet.transactions.reverse(),
  });
});

/* ============================================================
   ADMIN: GET ALL WALLETS
============================================================ */
export const getAllWallets = catchAsyncErrors(async (req, res, next) => {
  const wallets = await Wallet.find().populate("user", "name email role");

  res.status(200).json({
    success: true,
    count: wallets.length,
    wallets,
  });
});
