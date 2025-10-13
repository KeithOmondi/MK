import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // normalize input like "welcome10" → "WELCOME10"
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, "Discount value must be greater than 0"],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Minimum order value cannot be negative"],
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 1,
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Computed virtual: expired or not
couponSchema.virtual("isExpired").get(function () {
  return this.expiryDate && this.expiryDate < new Date();
});

// Hide internal fields from JSON
couponSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
  },
});

export default mongoose.model("Coupon", couponSchema);
