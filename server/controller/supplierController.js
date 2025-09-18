import Supplier from "../models/Supplier.js";
import asyncHandler from "express-async-handler";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

// @desc    Register as supplier
// @route   POST /api/suppliers/register
// @access  Private (User)
export const registerSupplier = asyncHandler(async (req, res) => {
  const {
    fullName,
    phoneNumber,
    address,
    idNumber,
    taxNumber,
    shopName,
    businessType,
    website,
  } = req.body;

  // ✅ Ensure no duplicate supplier profile
  const existingSupplier = await Supplier.findOne({ user: req.user._id });
  if (existingSupplier) {
    res.status(400);
    throw new Error("You already have a supplier profile");
  }

  // ✅ Handle optional file uploads
  let idDocument = {};
  let businessLicense = {};

  if (req.files?.idDocument) {
    const upload = await uploadToCloudinary(req.files.idDocument[0].buffer);
    idDocument = { url: upload.url, publicId: upload.public_id };
  }

  if (req.files?.businessLicense) {
    const upload = await uploadToCloudinary(req.files.businessLicense[0].buffer);
    businessLicense = { url: upload.url, publicId: upload.public_id };
  }

  // ✅ Create new supplier profile
  const supplier = new Supplier({
    user: req.user._id,
    fullName,
    phoneNumber,
    address,
    idNumber,
    idDocument,
    taxNumber,
    businessLicense,
    shopName,
    businessType,
    website,
    status: "Pending",   // always start as pending
    verified: false,     // must be approved by admin
  });

  const createdSupplier = await supplier.save();

  res.status(201).json({
    message: "Supplier profile created successfully. Awaiting admin approval.",
    supplier: createdSupplier,
  });
});



// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private (Admin)
export const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().populate("user products");
  res.json(suppliers);
});

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Public
export const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id)
    .populate("user")
    .populate("products");

  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  res.json(supplier);
});

// @desc    Update supplier profile
// @route   PUT /api/suppliers/:id
// @access  Private (Supplier or Admin)
export const updateSupplier = asyncHandler(async (req, res) => {
  const { shopName, businessType, status } = req.body;

  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  // Only supplier owner or admin can update
  if (
    supplier.user.toString() !== req.user._id.toString() &&
    req.user.role !== "Admin"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  supplier.shopName = shopName || supplier.shopName;
  supplier.businessType = businessType || supplier.businessType;

  // Only admin can update approval status
  if (req.user.role === "Admin" && status) {
    supplier.status = status; // "pending" | "approved" | "rejected"
  }

  const updatedSupplier = await supplier.save();
  res.json(updatedSupplier);
});

// @desc    Delete supplier (Admin only)
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin)
export const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  await supplier.deleteOne();
  res.json({ message: "Supplier deleted successfully" });
});
