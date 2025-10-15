import mongoose from "mongoose";

const { Schema } = mongoose;

/* ============================================================
   WALLET TRANSACTION SUBDOCUMENT
============================================================ */
const walletTransactionSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "deposit",
        "withdrawal",
        "payout",
        "platform_fee",
        "refund",
        "adjustment",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
    reference: {
      type: String,
      default: null, // e.g. Mpesa ref, Order ID, transaction ID
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Completed",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Object,
      default: {}, // for flexible extra data (like orderId, buyerId, etc.)
    },
  },
  { _id: false }
);

/* ============================================================
   WALLET MAIN SCHEMA
============================================================ */
const walletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // allow null for platform/system wallet
      unique: false,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: "KES",
    },
    transactions: [walletTransactionSchema],
  },
  { timestamps: true }
);

/* ============================================================
   HOOKS & VALIDATIONS
============================================================ */
walletSchema.pre("save", function (next) {
  if (this.balance < 0) {
    return next(new Error("Insufficient wallet balance."));
  }
  next();
});

/* ============================================================
   MODEL EXPORT
============================================================ */
const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
export default Wallet;
