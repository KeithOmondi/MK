import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // e.g. WELCOME10
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true }, // 10% or $10
    minOrderValue: { type: Number, default: 0 }, // optional minimum order
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1 }, // how many times coupon can be used
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
