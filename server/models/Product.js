import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      default: null, // for order-on-demand
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },

    // 🔥 Promotions
    isFlashSale: { type: Boolean, default: false },
    flashSaleEndDate: { type: Date },

    isDealOfWeek: { type: Boolean, default: false },
    dealEndDate: { type: Date },

    isNewArrival: { type: Boolean, default: false },
    newArrivalExpiry: { type: Date },

    // 📦 Logistics Information
    weight: { type: Number }, // in kg
    dimensions: {
      length: { type: Number }, // in cm
      width: { type: Number },
      height: { type: Number },
    },
    shippingRegions: [{ type: String }], // e.g. ["Kenya", "Uganda", "Tanzania"]
    deliveryTime: { type: String }, // e.g. "2-5 business days"
    freeShipping: { type: Boolean, default: false },
    warehouseLocation: { type: String }, // e.g. "Nairobi, KE"
    returnPolicy: { type: String }, // text describing policy
    warranty: { type: String }, // optional warranty info
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
