import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    method: {
      type: String,
      enum: ["card", "paypal", "mpesa", "bank_transfer", "cash_on_delivery"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // 👇 Refund tracking fields
    refundAmount: { type: Number, default: 0 },
    refundTransactionId: { type: String },
    refundReason: { type: String },
    refundDate: { type: Date },
  },
  { timestamps: true }
);

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;
