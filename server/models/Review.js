import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: true, // all reviews here are verified
    },
  },
  { timestamps: true }
);

// Prevent multiple reviews per product per order by same user
reviewSchema.index({ orderId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
