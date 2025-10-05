// src/controllers/productController.js
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import Category from "../models/Category.js";
import asyncHandler from "express-async-handler";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadToCloudinary.js";

/* -------------------- HELPERS -------------------- */
const validateDimensions = (dim) => {
  if (!dim) return false;
  const { length, width, height } = dim;
  return [length, width, height].every((v) => typeof v === "number" && v >= 0);
};

const validateVariants = (variants) =>
  Array.isArray(variants) &&
  variants.every(
    (v) =>
      (v.price == null || (typeof v.price === "number" && v.price >= 0)) &&
      (v.stock == null || (typeof v.stock === "number" && v.stock >= 0))
  );

/* -------------------- CREATE PRODUCT -------------------- */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    oldPrice,
    brand,
    stock,
    weight,
    dimensions: rawDimensions,
    shippingRegions,
    deliveryTime,
    warehouseLocation,
    returnPolicy,
    warranty,
    sections,
    freeShipping,
    flashSale = {},
    variants: rawVariants,
  } = req.body;

  if (!name || !description || !category || price == null)
    throw new Error("Name, description, category, and price are required.");
  if (price < 0) throw new Error("Price cannot be negative.");
  if (oldPrice != null && oldPrice < price) throw new Error("Old price cannot be less than current price.");

  const supplier = await Supplier.findOne({ user: req.user._id });
  if (!supplier) throw new Error("You must register as a supplier first.");

  const categoryExists = await Category.findById(category);
  if (!categoryExists) throw new Error("Category not found.");

  if (flashSale.startDate && flashSale.endDate && new Date(flashSale.endDate) <= new Date(flashSale.startDate))
    throw new Error("Flash sale endDate must be after startDate.");

  let dimensions = { length: 0, width: 0, height: 0 };
  if (rawDimensions) {
    try {
      dimensions = typeof rawDimensions === "string" ? JSON.parse(rawDimensions) : rawDimensions;
    } catch {
      throw new Error("Invalid dimensions format.");
    }
    if (!validateDimensions(dimensions)) throw new Error("Invalid dimensions.");
  }

  let variants = [];
  if (rawVariants) {
    try {
      variants = typeof rawVariants === "string" ? JSON.parse(rawVariants) : rawVariants;
    } catch {
      throw new Error("Invalid variants format.");
    }
    if (!validateVariants(variants)) throw new Error("Invalid variant data.");
  }

  if (!req.files?.length) throw new Error("At least one image is required.");
  const uploadResults = await Promise.allSettled(req.files.map((f) => uploadToCloudinary(f.buffer)));
  const successfulUploads = uploadResults.filter((r) => r.status === "fulfilled").map((r) => r.value);
  if (!successfulUploads.length) throw new Error("Image upload failed.");

  const allowedSections = ["FlashSales", "BestDeals", "NewArrivals", "TopTrending"];
  const formattedSections = (Array.isArray(sections) ? sections : [sections])
    .filter(Boolean)
    .filter((s) => allowedSections.includes(s));

  const product = await Product.create({
    name: name.trim(),
    description: description.trim(),
    category,
    supplier: supplier._id,
    price,
    oldPrice: oldPrice ?? null,
    brand: brand?.trim(),
    stock: stock ?? null,
    weight,
    dimensions,
    images: successfulUploads,
    sections: formattedSections.length ? formattedSections : ["NewArrivals"],
    shippingRegions: shippingRegions ? shippingRegions.split(",").map((r) => r.trim()) : [],
    deliveryTime,
    freeShipping: freeShipping ?? false,
    warehouseLocation,
    returnPolicy,
    warranty,
    flashSale: {
      isActive: flashSale.isActive ?? false,
      discountPercentage: flashSale.discountPercentage ?? 0,
      startDate: flashSale.startDate ?? null,
      endDate: flashSale.endDate ?? null,
    },
    variants,
    status: "pending",
    visibility: "private",
  });

  supplier.products.push(product._id);
  await supplier.save();

  res.status(201).json({
    status: "success",
    message: "Product submitted for admin approval.",
    data: product,
  });
});

/* -------------------- UPDATE PRODUCT -------------------- */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new Error("Product not found.");

  if (req.user.role !== "Admin" && product.supplier.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to update this product.");
  }

  const updates = req.body;

  if (updates.variants) {
    try {
      const parsedVariants = typeof updates.variants === "string" ? JSON.parse(updates.variants) : updates.variants;
      if (!validateVariants(parsedVariants)) throw new Error("Invalid variant data.");
      updates.variants = parsedVariants;
    } catch {
      throw new Error("Invalid variants format.");
    }
  }

  if (updates.dimensions && !validateDimensions(updates.dimensions)) throw new Error("Invalid dimensions.");

  if (updates.flashSale) {
    const { startDate, endDate } = updates.flashSale;
    if (startDate && endDate && new Date(endDate) <= new Date(startDate))
      throw new Error("Flash sale endDate must be after startDate.");
  }

  if (req.files?.length) {
    const uploadResults = await Promise.allSettled(req.files.map((f) => uploadToCloudinary(f.buffer)));
    const newImages = uploadResults.filter((r) => r.status === "fulfilled").map((r) => r.value);
    updates.images = [...(product.images || []), ...newImages];
  }

  // Admin approval logic
  if (req.user.role === "Admin" && updates.status === "approved") {
    updates.status = "active";
    updates.visibility = "public";
  }

  Object.entries(updates).forEach(([key, value]) => {
    if (value != null) product.set(key, value);
  });

  const updated = await product.save();
  res.json({ status: "success", message: "Product updated successfully.", data: updated });
});

/* -------------------- GET PRODUCTS -------------------- */
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;
  const isAdmin = req.query.admin === "true";

  const filters = {};
  if (!isAdmin) filters.status = "active";
  if (req.query.category) filters.category = req.query.category;
  if (req.query.section) filters.sections = req.query.section;

  const count = await Product.countDocuments(filters);
  const products = await Product.find(filters)
    .populate("category supplier", "name shopName")
    .sort({ createdAt: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .lean();

  res.json({
    status: "success",
    total: count,
    page,
    pages: Math.ceil(count / pageSize),
    data: products,
  });
});

/* -------------------- GET SINGLE PRODUCT -------------------- */
export const getProductById = asyncHandler(async (req, res) => {
  const idOrSlug = req.params.id;
  let product;

  if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    product = await Product.findById(idOrSlug).populate("category supplier", "name shopName").lean();
  }
  if (!product) {
    product = await Product.findOne({ "seo.slug": idOrSlug }).populate("category supplier", "name shopName").lean();
  }

  if (!product) throw new Error("Product not found.");
  res.json({ status: "success", data: product });
});

/* -------------------- DELETE PRODUCT -------------------- */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new Error("Product not found.");

  if (req.user.role !== "Admin" && product.supplier.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to delete this product.");
  }

  product.status = "inactive";
  product.visibility = "hidden";
  product.deletedAt = new Date();
  await product.save();

  res.json({ status: "success", message: "Product deactivated successfully." });
});

/* -------------------- HOMEPAGE PRODUCTS -------------------- */
export const getHomepageProducts = asyncHandler(async (req, res) => {
  const sections = ["FlashSales", "BestDeals", "NewArrivals", "TopTrending"];
  const result = {};

  for (const section of sections) {
    result[section.toLowerCase()] = await Product.find({ sections: section, status: "active" })
      .populate("category supplier", "name shopName")
      .limit(10)
      .lean();
  }

  res.json({ status: "success", data: result });
});

/* -------------------- GET ALL PRODUCTS FOR ADMIN -------------------- */
export const getAllProductsForAdmin = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;

  const filters = {};
  if (req.query.status) filters.status = req.query.status; // pending, active, inactive
  if (req.query.category) filters.category = req.query.category;
  if (req.query.supplier) filters.supplier = req.query.supplier;

  const count = await Product.countDocuments(filters);
  const products = await Product.find(filters)
    .populate("category supplier", "name shopName")
    .sort({ createdAt: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .lean();

  res.json({
    status: "success",
    total: count,
    page,
    pages: Math.ceil(count / pageSize),
    data: products,
  });
});


export const deleteProductImage = asyncHandler(async (req, res) => {
  const { productId, publicId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Verify ownership (supplier can only delete their own images)
  if (
    req.user.role === "Supplier" &&
    product.supplier.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("You are not authorized to delete this image");
  }

  // Remove from Cloudinary
  await cloudinary.uploader.destroy(publicId);

  // Remove from product.images array
  product.images = product.images.filter((img) => img.public_id !== publicId);
  await product.save();

  res.status(200).json({
    status: "success",
    message: "Image removed successfully",
    data: product.images,
  });
});