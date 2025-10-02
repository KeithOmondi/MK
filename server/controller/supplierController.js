import Supplier from "../models/Supplier.js";
import asyncHandler from "express-async-handler";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadToCloudinary.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendMail.js";
import { User } from "../models/userModel.js";

// -------------------------
// Register Supplier
// -------------------------
export const registerSupplier = asyncHandler(async (req, res) => {
  const {
    username,
    email,
    sellerType,
    referralCode,
    fullName,
    phoneNumber,
    address,
    idNumber,
    taxNumber,
    shopName,
    businessType,
    website,
    bankName,
    accountNumber,
    accountName,
    branch,
  } = req.body;

  // Prevent duplicate User accounts
  if (await User.findOne({ email })) {
    return res.status(400).json({ message: "Email already in use" });
  }

  // Prevent duplicate Shop names
  if (await Supplier.findOne({ shopName })) {
    return res.status(400).json({ message: "Shop name already taken" });
  }

  // Upload documents
  let idDocument = {}, businessLicense = {}, passportPhoto = {};
  if (req.files?.idDocument?.[0]) {
    const upload = await uploadToCloudinary(req.files.idDocument[0].buffer);
    idDocument = { url: upload.url, publicId: upload.public_id };
  }
  if (req.files?.businessLicense?.[0]) {
    const upload = await uploadToCloudinary(req.files.businessLicense[0].buffer);
    businessLicense = { url: upload.url, publicId: upload.public_id };
  }
  if (req.files?.passportPhoto?.[0]) {
    const upload = await uploadToCloudinary(req.files.passportPhoto[0].buffer);
    passportPhoto = { url: upload.url, publicId: upload.public_id };
  }

  // Create the User account with temporary password (not emailed yet)
  const tempPassword = crypto.randomBytes(8).toString("hex");
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = await User.create({
    name: fullName,
    email,
    password: hashedPassword,
    role: "Supplier",
    phoneNumber,
    forcePasswordChange: true,
  });

  // Create the Supplier profile
  const supplier = await Supplier.create({
    user: user._id,
    username,
    email,
    sellerType,
    referralCode,
    fullName,
    phoneNumber,
    address,
    idNumber,
    idDocument,
    taxNumber,
    businessLicense,
    passportPhoto,
    shopName,
    businessType,
    website,
    bankName,
    accountNumber,
    accountName,
    branch,
    status: "Pending",
    verified: false,
  });

  res.status(201).json({
    success: true,
    message: "Supplier profile created. Awaiting admin approval.",
    data: supplier,
  });
});

// -------------------------
// Update Supplier (Admin Approval)
// -------------------------
export const updateSupplier = asyncHandler(async (req, res) => {
  const {
    username,
    email,
    sellerType,
    referralCode,
    shopName,
    businessType,
    website,
    fullName,
    phoneNumber,
    address,
    bankName,
    accountNumber,
    accountName,
    branch,
    status,
  } = req.body;

  const supplier = await Supplier.findById(req.params.id).populate("user");
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  // Authorization
  if (supplier.user._id.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
    res.status(403);
    throw new Error("Not authorized");
  }

  // Update basic fields
  supplier.username = username || supplier.username;
  supplier.email = email || supplier.email;
  supplier.sellerType = sellerType || supplier.sellerType;
  supplier.referralCode = referralCode || supplier.referralCode;
  supplier.fullName = fullName || supplier.fullName;
  supplier.phoneNumber = phoneNumber || supplier.phoneNumber;
  supplier.address = address || supplier.address;
  supplier.shopName = shopName || supplier.shopName;
  supplier.businessType = businessType || supplier.businessType;
  supplier.website = website || supplier.website;
  supplier.bankName = bankName || supplier.bankName;
  supplier.accountNumber = accountNumber || supplier.accountNumber;
  supplier.accountName = accountName || supplier.accountName;
  supplier.branch = branch || supplier.branch;

  // Admin approval workflow
  if (req.user.role === "Admin" && status) {
    const statusChanged = supplier.status !== status;
    supplier.status = status;
    supplier.verified = status === "Approved";

    if (status === "Approved" && statusChanged) {
      // Generate a new temporary password
      const tempPassword = crypto.randomBytes(8).toString("hex");
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      supplier.user.password = hashedPassword;
      supplier.user.forcePasswordChange = true;
      await supplier.user.save();

      // Send approval email with login details
      try {
        await sendEmail({
          email: supplier.user.email,
          subject: "✅ Supplier Account Approved",
          message: `Hello ${supplier.fullName},\n\nYour supplier account has been approved.\n\nLogin details:\n- Email: ${supplier.user.email}\n- Temporary Password: ${tempPassword}\n\nPlease log in and change your password immediately.`,
        });
      } catch (err) {
        console.error("❌ Email sending failed:", err);
      }
    }
  }

  const updatedSupplier = await supplier.save();
  res.json({
    success: true,
    message: "Supplier updated successfully",
    data: updatedSupplier,
  });
});

// -------------------------
// Delete Supplier (Admin)
// -------------------------
export const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id).populate("user");
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  // Delete uploaded files
  try {
    if (supplier.idDocument?.publicId) await deleteFromCloudinary(supplier.idDocument.publicId);
    if (supplier.businessLicense?.publicId) await deleteFromCloudinary(supplier.businessLicense.publicId);
    if (supplier.passportPhoto?.publicId) await deleteFromCloudinary(supplier.passportPhoto.publicId);
  } catch (err) {
    console.error("⚠️ Cloudinary cleanup failed:", err);
  }

  // Delete linked User account
  if (supplier.user?._id) await User.findByIdAndDelete(supplier.user._id);

  // Delete Supplier
  await supplier.deleteOne();

  res.json({ success: true, message: "Supplier and linked User account deleted successfully" });
});

// -------------------------
// Get Supplier by ID
// -------------------------
export const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id)
    .populate("user", "name email role")
    .populate("products", "name price stock");

  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  res.status(200).json({ success: true, data: supplier });
});

// -------------------------
// Get All Suppliers (Admin)
// -------------------------
export const getSuppliers = asyncHandler(async (_, res) => {
  const suppliers = await Supplier.find()
    .populate("user", "name email role")
    .populate("products", "name price stock");

  res.status(200).json({ success: true, data: suppliers });
});
