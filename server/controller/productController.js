import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import Category from "../models/Category.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";

const ObjectId = mongoose.Types.ObjectId;

export const ALLOWED_SECTIONS = ["FlashSales", "BestDeals", "NewArrivals", "TopTrending"];
const MAX_PAGE_SIZE = 100;

/* ----------------- Helpers ----------------- */
const isValidObjectId = (id) => ObjectId.isValid(id);

const safeJSON = (val) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return null;
  }
};

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

/* ----------------- CREATE PRODUCT ----------------- */
export const createProduct = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { name, description, category, price } = body;

  if (!name || !description || !category || price == null) {
    res.status(400);
    throw new Error("Name, description, category, and price are required.");
  }

  if (!isValidObjectId(category)) {
    res.status(400);
    throw new Error("Invalid category ID.");
  }

  const supplier = await Supplier.findOne({ user: req.user._id }).select("_id");
  if (!supplier) {
    res.status(403);
    throw new Error("You must register as a supplier first.");
  }

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    res.status(404);
    throw new Error("Category not found.");
  }

  const dimensions = safeJSON(body.dimensions) || { length: 0, width: 0, height: 0 };
  const variants = safeJSON(body.variants) || [];

  let stockValue = Number(body.stock) || 0;
  if (variants.length > 0) {
    const totalStock = variants.reduce((a, v) => a + (v.stock || 0), 0);
    if (totalStock > 0) stockValue = totalStock;
  }

  const sectionsArr = (() => {
    const parsed = safeJSON(body.sections);
    if (Array.isArray(parsed)) return parsed.filter((s) => ALLOWED_SECTIONS.includes(s));
    if (typeof parsed === "string" && ALLOWED_SECTIONS.includes(parsed)) return [parsed];
    return ["NewArrivals"];
  })();

  const uploadResults = req.files
    ? await Promise.allSettled(req.files.map((f) => uploadToCloudinary(f.buffer)))
    : [];
  const successfulUploads = uploadResults
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  // Generate SKU
  const catPrefix = categoryDoc.name?.slice(0, 3).toUpperCase() || "GEN";
  const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const generatedSKU = `MK-${catPrefix}-${dateCode}-${rand}`;

  const payload = {
    name,
    description,
    category,
    supplier: supplier._id,
    price,
    stock: stockValue,
    images: successfulUploads,
    sections: sectionsArr,
    sku: generatedSKU,
    status: "pending",
    visibility: "private",
    weight: Number(body.weight) || 0,
    dimensions,
    variants,
    fragility: body.fragility || "low",
    shippingRegions: safeJSON(body.shippingRegions) || [],
    deliveryTime: body.deliveryTime || "",
    freeShippingThreshold: Number(body.freeShippingThreshold) || 5000,
    warehouseLocation: body.warehouseLocation || "",
    returnPolicy: body.returnPolicy || "",
    warranty: body.warranty || "",
    flashSale: safeJSON(body.flashSale) || {},
    tags: safeJSON(body.tags) || [],
    discountType: body.discountType || "none",
    discountValue: Number(body.discountValue) || 0,
    taxRate: Number(body.taxRate) || 0,
    barcode: body.barcode || "",
    flags: safeJSON(body.flags) || {},
    seo: safeJSON(body.seo) || {},
  };

  const product = await Product.create(payload);
  res.status(201).json({ status: "success", data: product });
});

/* ----------------- UPDATE PRODUCT ----------------- */
export const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid product id.");
  }

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  if (req.user.role !== "Admin" && product.supplier.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to update this product.");
  }

  const updates = { ...(req.body || {}) };

  // Parse and validate variants & dimensions
  if (updates.variants) {
    const parsed = safeJSON(updates.variants) || updates.variants;
    if (!validateVariants(parsed)) {
      res.status(400);
      throw new Error("Invalid variants data.");
    }
    updates.variants = parsed;
  }
  if (updates.dimensions && !validateDimensions(updates.dimensions)) {
    res.status(400);
    throw new Error("Invalid dimensions.");
  }

  // Flash sale validation
  if (updates.flashSale) {
    const fs = safeJSON(updates.flashSale) || updates.flashSale;
    if (fs.startDate && fs.endDate && new Date(fs.endDate) <= new Date(fs.startDate)) {
      res.status(400);
      throw new Error("Flash sale endDate must be after startDate.");
    }
    updates.flashSale = fs;
  }

  // Handle uploaded images
  if (req.files && req.files.length) {
    const uploadResults = await Promise.allSettled(req.files.map((f) => uploadToCloudinary(f.buffer)));
    const newImages = uploadResults.filter((r) => r.status === "fulfilled").map((r) => r.value);
    updates.images = [...(product.images || []), ...newImages];
  }

  // Admin approval shortcut
  if (req.user.role === "Admin" && updates.status === "approved") {
    updates.status = "active";
    updates.visibility = "public";
  }

  const allowed = [
    "name","description","price","oldPrice","brand","stock","weight","dimensions","images",
    "sections","shippingRegions","deliveryTime","freeShippingThreshold","warehouseLocation",
    "returnPolicy","warranty","flashSale","variants","status","visibility","tags",
    "discountType","discountValue","taxRate","sku","barcode","flags","seo","fragility"
  ];
  for (const [k, v] of Object.entries(updates)) {
    if (allowed.includes(k) && v != null) product.set(k, v);
  }

  const updated = await product.save();
  res.json({ status: "success", message: "Product updated successfully.", data: updated });
});

/* ---------- homepage products ---------- */
export const getHomepageProducts = asyncHandler(async (req, res) => {
  const sections = ALLOWED_SECTIONS;
  const result = {};

  await Promise.all(
    sections.map(async (section) => {
      const docs = await Product.find({
        sections: section,
        status: "active",
        deletedAt: null,
      })
        .populate("category supplier", "name shopName")
        .limit(10)
        .lean();
      result[section.toLowerCase()] = docs;
    })
  );

  res.json({ status: "success", data: result });
});

/* ---------- get products by single section ---------- */
export const getProductsBySection = asyncHandler(async (req, res) => {
  const { section } = req.params;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const sort = req.query.sort === "latest" ? { createdAt: -1 } : { price: 1 };

  if (!ALLOWED_SECTIONS.includes(section)) {
    return res.status(400).json({
      status: "error",
      message: `Invalid section. Allowed: ${ALLOWED_SECTIONS.join(", ")}`,
    });
  }

  const products = await Product.find({
    sections: section,
    status: "active",
    deletedAt: null,
  })
    .populate("category supplier", "name shopName")
    .sort(sort)
    .limit(limit)
    .lean();

  res.json({ status: "success", section, total: products.length, data: products });
});

;

/* ---------- get products (public + filters + paging) ---------- */
export const getProducts = asyncHandler(async (req, res) => {
  const rawLimit = Number(req.query.limit) || 12;
  const pageSize = Math.min(Math.max(1, rawLimit), MAX_PAGE_SIZE);
  const page = Math.max(1, Number(req.query.page) || 1);
  const isAdmin = req.query.admin === "true";

  const filters = { deletedAt: null };
  if (!isAdmin) filters.status = "active";

  if (req.query.category && isValidObjectId(req.query.category)) {
    filters.category = req.query.category;
  } else if (req.query.category) {
    filters["category"] = req.query.category;
  }

  if (req.query.section) filters.sections = req.query.section;

  if (req.query.q) {
    // text search
    filters.$text = { $search: String(req.query.q) };
  }

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

/* ---------- get single product by id or slug ---------- */
export const getProductById = asyncHandler(async (req, res) => {
  const idOrSlug = req.params.id;
  let product = null;

  // ✅ Try fetching by MongoDB _id first
  if (isValidObjectId(idOrSlug)) {
    product = await Product.findOne({ _id: idOrSlug, deletedAt: null })
      .populate("category supplier", "name shopName")
      .lean();
  }

  // ✅ If not found, try fetching by SEO slug
  if (!product) {
    product = await Product.findOne({ "seo.slug": idOrSlug, deletedAt: null })
      .populate("category supplier", "name shopName")
      .lean();
  }

  // ✅ Handle not found
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  // ✅ Return product in consistent format
  res.status(200).json({
    status: "success",
    data: product,
  });
});


/* ---------- get products by category (id or slug/name) ---------- */
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pageSize = Math.min(
    Math.max(1, Number(req.query.limit) || 12),
    MAX_PAGE_SIZE
  );
  const page = Math.max(1, Number(req.query.page) || 1);

  let categoryFilter = null;

  if (isValidObjectId(id)) {
    categoryFilter = { category: id };
  } else {
    const categoryDoc = await Category.findOne({
      $or: [{ name: id }, { slug: id }],
    }).select("_id");
    if (!categoryDoc) {
      res.status(404);
      throw new Error(`Category '${id}' not found`);
    }
    categoryFilter = { category: categoryDoc._id };
  }

  const baseFilter = { ...categoryFilter, status: "active", deletedAt: null };
  const count = await Product.countDocuments(baseFilter);

  const products = await Product.find(baseFilter)
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

/* ---------- soft-delete product (deactivate) ---------- */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  if (
    req.user.role !== "Admin" &&
    product.supplier.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("You are not authorized to delete this product.");
  }

  product.status = "inactive";
  product.visibility = "hidden";
  product.deletedAt = new Date();
  await product.save();

  res.json({ status: "success", message: "Product deactivated successfully." });
});



/* ---------- admin list ---------- */
export const getAllProductsForAdmin = asyncHandler(async (req, res) => {
  const pageSize = Math.min(
    Math.max(1, Number(req.query.limit) || 20),
    MAX_PAGE_SIZE
  );
  const page = Math.max(1, Number(req.query.page) || 1);

  const filters = { deletedAt: null };
  if (req.query.status) filters.status = req.query.status;
  if (req.query.category && isValidObjectId(req.query.category))
    filters.category = req.query.category;
  if (req.query.supplier && isValidObjectId(req.query.supplier))
    filters.supplier = req.query.supplier;

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

/* ---------- delete product image ---------- */
export const deleteProductImage = asyncHandler(async (req, res) => {
  const { productId, publicId } = req.params;

  if (!isValidObjectId(productId)) {
    res.status(400);
    throw new Error("Invalid product id.");
  }

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

  // delete from cloudinary via helper
  await deleteFromCloudinary(publicId);

  // remove from product.images array
  product.images = (product.images || []).filter(
    (img) => img.public_id !== publicId
  );
  await product.save();

  res.status(200).json({
    status: "success",
    message: "Image removed successfully",
    data: product.images,
  });
});
