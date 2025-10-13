import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Optional: link to an order (for purchases)
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false, // wallet deposits/withdrawals won't have orders
    },

    // User who made the payment or top-up
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Payment type
    method: {
      type: String,
      enum: ["card", "paypal", "mpesa", "bank_transfer", "cash_on_delivery", "wallet"],
      required: true,
    },

    // Amount of the transaction
    amount: {
      type: Number,
      required: true,
    },

    // Status of the transaction
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },

    // Unique transaction reference (from M-Pesa, PayPal, etc.)
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // For refunds
    refundAmount: { type: Number, default: 0 },
    refundTransactionId: { type: String },
    refundReason: { type: String },
    refundDate: { type: Date },

    // Optional: track if it's a wallet top-up or withdrawal
    walletType: {
      type: String,
      enum: ["deposit", "withdrawal"],
    },

    // Optional: phone number or details for M-Pesa payout/deposit
    referenceDetails: {
      type: String,
    },
  },
  { timestamps: true }
);

// Model
const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;
