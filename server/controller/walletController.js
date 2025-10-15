import Wallet from "../models/Wallet.js";
import User from "../models/userModel.js";
import Order from "../models/Order.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";

const PLATFORM_FEE_RATE = 0.05; // 5%

/* ============================================================
   CREATE WALLET
============================================================ */
export const createWallet = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  const existingWallet = await Wallet.findOne({ user: userId });
  if (existingWallet) return next(new ErrorHandler("Wallet already exists", 400));

  const wallet = await Wallet.create({
    user: userId,
    balance: 0,
    currency: "KES",
    transactions: [],
  });

  res.status(201).json({
    success: true,
    message: "Wallet created successfully",
    wallet,
  });
});

/* ============================================================
   GET MY WALLET
============================================================ */
export const getMyWallet = catchAsyncErrors(async (req, res, next) => {
  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) return next(new ErrorHandler("Wallet not found", 404));

  res.status(200).json({ success: true, wallet });
});

/* ============================================================
   DEPOSIT FUNDS (e.g., Payment Confirmation / Escrow Release)
============================================================ */
export const depositFunds = catchAsyncErrors(async (req, res, next) => {
  const { amount, description, reference } = req.body;
  if (!amount || amount <= 0)
    return next(new ErrorHandler("Invalid deposit amount", 400));

  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) return next(new ErrorHandler("Wallet not found", 404));

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
   WITHDRAW FUNDS (Supplier Payout or User Withdrawal)
============================================================ */
export const withdrawFunds = catchAsyncErrors(async (req, res, next) => {
  const { amount, description, reference } = req.body;
  if (!amount || amount <= 0)
    return next(new ErrorHandler("Invalid withdrawal amount", 400));

  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) return next(new ErrorHandler("Wallet not found", 404));
  if (wallet.balance < amount)
    return next(new ErrorHandler("Insufficient balance", 400));

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
   RELEASE ESCROW TO SUPPLIER (After Order Delivery)
============================================================ */
export const releaseEscrowToSupplier = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate("supplier");
  if (!order) return next(new ErrorHandler("Order not found", 404));

  if (order.paymentStatus !== "held")
    return next(new ErrorHandler("Payment not in escrow", 400));

  const supplierWallet = await Wallet.findOne({ user: order.supplier._id });
  if (!supplierWallet)
    return next(new ErrorHandler("Supplier wallet not found", 404));

  // Calculate platform fee
  const platformFee = order.totalAmount * PLATFORM_FEE_RATE;
  const supplierEarnings = order.totalAmount - platformFee;

  // Credit supplier
  supplierWallet.balance += supplierEarnings;
  supplierWallet.transactions.push({
    type: "payout",
    amount: supplierEarnings,
    description: `Earnings from order #${order._id}`,
    reference: order._id,
    date: new Date(),
  });
  await supplierWallet.save();

  // Credit platform (optional: store in system wallet)
  const platformWallet = await Wallet.findOne({ user: null }); // if you set a system account
  if (platformWallet) {
    platformWallet.balance += platformFee;
    platformWallet.transactions.push({
      type: "platform_fee",
      amount: platformFee,
      description: `Platform commission from order #${order._id}`,
      reference: order._id,
      date: new Date(),
    });
    await platformWallet.save();
  }

  // Update order status
  order.paymentStatus = "released";
  order.paymentReleaseStatus = "Released";
  await order.save();

  res.status(200).json({
    success: true,
    message: "Escrow released to supplier successfully",
    supplierEarnings,
    platformFee,
  });
});

/* ============================================================
   GET MY TRANSACTIONS
============================================================ */
export const getMyTransactions = catchAsyncErrors(async (req, res, next) => {
  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) return next(new ErrorHandler("Wallet not found", 404));

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
