import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  code: String,
  expiresAt: Date,
});

const supplierSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one supplier per user
    },

    // -----------------------------
    // Account / Personal Info
    // -----------------------------
    username: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },
    phoneNumber: { type: String, required: true, trim: true },
    sellerType: {
      type: String,
      enum: ["Individual", "Company"],
      default: "Individual",
    },
    referralCode: { type: String, trim: true },

    fullName: { type: String, trim: true, required: true },
    address: { type: String, required: true },

    // -----------------------------
    // Legal / Documents
    // -----------------------------
    idNumber: { type: String, required: true },
    idDocument: { url: String, publicId: String },
    taxNumber: { type: String },
    businessLicense: { url: String, publicId: String },
    passportPhoto: { url: String, publicId: String }, // <-- new field

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
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    otp: OTPSchema,

    // Linked products
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", supplierSchema);
