import mongoose from "mongoose";

const pendingPaymentSchema = new mongoose.Schema(
  {
    checkoutRequestId: { type: String, required: true, unique: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    phoneNumber: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    failedReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PendingPayment", pendingPaymentSchema);
