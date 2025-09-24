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
    oldPrice: {
      type: Number,
      min: [0, "Old price cannot be negative"],
      default: null, // ✅ added for discounts
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

    // 🆕 Brand & Variations
    brand: { type: String },
    color: { type: String },
    size: { type: String },

    // 🔥 Homepage Sections
    sections: [
      {
        type: String,
        enum: ["FlashSales", "BestDeals", "NewArrivals", "TopTrending"],
      },
    ],

    // 📦 Logistics Information
    weight: { type: Number }, // in kg
    dimensions: {
      length: { type: Number }, // in cm
      width: { type: Number },
      height: { type: Number },
    },
    shippingRegions: [{ type: String }],
    deliveryTime: { type: String },
    freeShipping: { type: Boolean, default: false },
    warehouseLocation: { type: String },
    returnPolicy: { type: String },
    warranty: { type: String },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
