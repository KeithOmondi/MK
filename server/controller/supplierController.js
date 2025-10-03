import Supplier from "../models/Supplier.js";
import asyncHandler from "express-async-handler";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadToCloudinary.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendMail.js";
import { User } from "../models/userModel.js";

// -------------------------
// Register Supplier (Final Step)
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

  // ✅ Ensure user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Please create and verify your account first." });
  }

  // ✅ Ensure email is verified
  if (!user.accountVerified) {
    return res.status(400).json({ message: "Email not verified. Complete OTP verification first." });
  }

  // ✅ Prevent duplicate shop name
  if (await Supplier.findOne({ shopName })) {
    return res.status(400).json({ message: "Shop name already taken" });
  }

  // ✅ Prevent duplicate Supplier profile for same user
  let existingSupplier = await Supplier.findOne({ user: user._id });
  if (existingSupplier) {
    return res.status(200).json({
      success: true,
      message: "You already have a supplier profile. Awaiting admin approval if not approved yet.",
      data: { supplierId: existingSupplier._id, email },
    });
  }

  // Upload docs
  let idDocument = {},
      businessLicense = {},
      passportPhoto = {};

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

  // ✅ Upgrade user role to Supplier if not already
  if (user.role !== "Supplier") {
    user.role = "Supplier";
    await user.save();
  }

  // ✅ Create Supplier profile linked to existing verified user
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
    status: "Pending", // needs admin approval
    verified: true,    // email already verified
  });

  res.status(201).json({
    success: true,
    message: "Supplier application submitted successfully. Awaiting admin approval.",
    data: { supplierId: supplier._id, email },
  });
});



// -------------------------
// Verify Supplier Email (OTP)
// -------------------------
export const verifySupplierOtp = asyncHandler(async (req, res) => {
  const { supplierId, otp } = req.body;

  const supplier = await Supplier.findById(supplierId).populate("user");
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  if (!supplier.emailVerificationCode || supplier.emailVerificationExpiry < Date.now()) {
    res.status(400);
    throw new Error("OTP expired. Please request a new one.");
  }

  const isMatch = await bcrypt.compare(otp, supplier.emailVerificationCode);
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  supplier.verified = true;
  supplier.emailVerificationCode = undefined;
  supplier.emailVerificationExpiry = undefined;
  await supplier.save();

  res.json({ success: true, message: "Supplier email verified. Awaiting admin approval." });
});

// -------------------------
// Resend OTP for Supplier Verification
// -------------------------
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // If already verified, don’t resend
  if (user.accountVerified) {
    return res.status(400).json({ message: "Account already verified" });
  }

  // Limit OTP resends (security measure)
  if (user.resendAttempts >= 3 && user.lastOtpSentAt && Date.now() - user.lastOtpSentAt < 60 * 60 * 1000) {
    return res
      .status(429)
      .json({ message: "Too many OTP requests. Please try again after 1 hour." });
  }

  // Generate new OTP
  const otp = user.generateOtp();
  user.resendAttempts += 1;
  user.lastOtpSentAt = Date.now();
  await user.save();

  // Send email with OTP
  try {
    await sendEmail({
      email: user.email,
      subject: "🔑 Resend OTP - Account Verification",
      message: `Hello ${user.name},\n\nHere is your new OTP code: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn’t request this, please ignore this email.`,
    });

    res.status(200).json({
      success: true,
      message: "New OTP has been sent to your email",
    });
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    res.status(500).json({ message: "Failed to send OTP email" });
  }
});



// -------------------------
// Update Supplier (Admin Approval)
// -------------------------
export const updateSupplier = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const supplier = await Supplier.findById(req.params.id).populate("user");

  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  if (req.user.role !== "Admin") {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (status && supplier.status !== status) {
    supplier.status = status;

    if (status === "Approved") {
      try {
        await sendEmail({
          email: supplier.user.email,
          subject: "✅ Supplier Account Approved",
          message: `Hello ${supplier.fullName},\n\nYour supplier account has been approved.\nYou can now log in to your dashboard and start listing products.`,
        });
      } catch (err) {
        console.error("❌ Approval email failed:", err);
      }
    }
  }

  const updatedSupplier = await supplier.save();
  res.json({ success: true, message: "Supplier updated", data: updatedSupplier });
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
