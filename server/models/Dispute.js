import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order ID is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Seller reference is required"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    type: {
      type: String,
      enum: ["Product Issue", "Late Delivery", "Wrong Item", "Refund", "Other"],
      required: [true, "Dispute type is required"],
    },
    reason: {
      type: String,
      trim: true,
      required: [true, "Please provide a reason for the dispute"],
    },
    status: {
      type: String,
      enum: ["Pending", "In Review", "Resolved", "Escalated", "Closed"],
      default: "Pending",
    },
    evidence: {
      type: [String], // array of URLs or file paths
    },
    resolutionNotes: {
      type: String,
      trim: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

const Dispute = mongoose.model("Dispute", disputeSchema);

export default Dispute;
