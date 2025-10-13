import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["deposit", "withdrawal"],
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
      default: null, // e.g., Mpesa ref, transaction id
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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

// Ensure negative balance is not possible
walletSchema.pre("save", function (next) {
  if (this.balance < 0) {
    return next(new Error("Insufficient wallet balance."));
  }
  next();
});

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
