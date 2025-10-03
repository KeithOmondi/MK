// models/supplierModel.ts
import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    // Linked user account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1 user = 1 supplier profile
    },

    // -----------------------------
    // Personal / Contact
    // -----------------------------
    phoneNumber: { type: String, required: true, trim: true },
    sellerType: {
      type: String,
      enum: ["Individual", "Company"],
      default: "Individual",
    },
    referralCode: { type: String, trim: true },

    // -----------------------------
    // Legal / Documents
    // -----------------------------
    fullName: { type: String, trim: true, required: true },
    address: { type: String, required: true },
    idNumber: { type: String, required: true },
    idDocument: { url: String, publicId: String },
    taxNumber: { type: String },
    businessLicense: { url: String, publicId: String },
    passportPhoto: { url: String, publicId: String },

    // -----------------------------
    // Shop Info
    // -----------------------------
    shopName: { type: String, required: true },
    businessType: {
      type: String,
      enum: ["wholesaler", "retailer", "manufacturer"],
      required: true,
    },
    website: { type: String },

    // -----------------------------
    // Settlement Info
    // -----------------------------
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    branch: { type: String },

    // -----------------------------
    // Workflow / System
    // -----------------------------
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    verified: { type: Boolean, default: false }, // email verification
    emailVerificationCode: { type: String },
    emailVerificationExpiry: { type: Date },
    rating: { type: Number, default: 0 },

    // Linked products
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", supplierSchema);
