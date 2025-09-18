// models/supplierModel.js
import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one supplier per user
    },

    // 📌 Personal / Contact Info
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },

    // 📌 Legal / Security
    idNumber: {
      type: String,
      required: true,
    },
    idDocument: {
      url: { type: String }, // Cloudinary/S3 URL
      publicId: { type: String }, // Cloudinary/S3 publicId
    },
    taxNumber: {
      type: String, // e.g. KRA PIN in Kenya
    },
    businessLicense: {
      url: { type: String },
      publicId: { type: String },
    },

    // 📌 Shop Info
    shopName: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      enum: ["wholesaler", "retailer", "manufacturer"],
      required: true,
    },
    website: {
      type: String,
      require: false
    },

    // 📌 System / Workflow
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "pending",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },

    // 📌 Linked Products
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
