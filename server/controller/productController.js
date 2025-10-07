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

const ALLOWED_SECTIONS = [
  "FlashSales",
  "BestDeals",
  "NewArrivals",
  "TopTrending",
];
const MAX_PAGE_SIZE = 100;

/* ---------- helpers ---------- */
const isValidObjectId = (id) => ObjectId.isValid(id);

const parseJSON = (input) => {
  if (!input) return null;
  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch {
      return null;
    }
  }
  return input;
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

/* ---------- Safe JSON parse helper ---------- */
const safeJSON = (value) => {
  if (!value) return null;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
};

/* ---------- CREATE PRODUCT ---------- */
export const createProduct = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { name, description, category, price } = body;

  /* ---------- Required field validation ---------- */
  if (!name || !description || !category || price == null) {
    res.status(400);
    throw new Error("Name, description, category, and price are required.");
  }
  if (price < 0) {
    res.status(400);
    throw new Error("Price cannot be negative.");
  }
  if (!isValidObjectId(category)) {
    res.status(400);
    throw new Error("Invalid category ID.");
  }

  /* ---------- Verify supplier ---------- */
  const supplier = await Supplier.findOne({ user: req.user._id }).select(
    "_id products"
  );
  if (!supplier) {
    res.status(403);
    throw new Error("You must register as a supplier first.");
  }

  /* ---------- Validate category ---------- */
  const categoryDoc = await Category.findById(category).select("name _id");
  if (!categoryDoc) {
    res.status(404);
    throw new Error("Category not found.");
  }

  /* ---------- Dimensions ---------- */
  const dimensionsRaw = safeJSON(body.dimensions);
  let dimensions = { length: 0, width: 0, height: 0 };
  if (dimensionsRaw) {
    if (!validateDimensions(dimensionsRaw)) {
      res.status(400);
      throw new Error("Invalid dimensions format.");
    }
    dimensions = dimensionsRaw;
  }

  /* ---------- Variants ---------- */
  const variantsRaw = safeJSON(body.variants);
  let variants = [];
  if (Array.isArray(variantsRaw) && variantsRaw.length > 0) {
    const validVariants = variantsRaw.filter(
      (v) =>
        (v.price > 0 && typeof v.price === "number") ||
        (v.stock > 0 && typeof v.stock === "number")
    );
    if (!validateVariants(validVariants)) {
      res.status(400);
      throw new Error("Invalid variants data.");
    }
    variants = validVariants;
  }

  /* ---------- Stock ---------- */
  let stockValue = Number(body.stock) || 0;
  if (variants.length > 0) {
    const variantStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);
    if (variantStock > 0) stockValue = variantStock;
  }

  /* ---------- Flash Sale ---------- */
  const flashSale = safeJSON(body.flashSale) || {};
  if (flashSale?.startDate && flashSale?.endDate) {
    if (new Date(flashSale.endDate) <= new Date(flashSale.startDate)) {
      res.status(400);
      throw new Error("Flash sale endDate must be after startDate.");
    }
  }

  /* ---------- Images ---------- */
  if (!req.files?.length) {
    res.status(400);
    throw new Error("At least one product image is required.");
  }

  const uploadResults = await Promise.allSettled(
    req.files.map((f) => uploadToCloudinary(f.buffer))
  );

  const successfulUploads = uploadResults
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  if (!successfulUploads.length) {
    res.status(500);
    throw new Error("Image upload failed. Please retry.");
  }

  /* ---------- Sections ---------- */
  let sectionsArr = [];
  try {
    const parsed = safeJSON(body.sections);
    if (Array.isArray(parsed)) {
      sectionsArr = parsed.filter((s) => ALLOWED_SECTIONS.includes(s));
    } else if (
      typeof parsed === "string" &&
      ALLOWED_SECTIONS.includes(parsed)
    ) {
      sectionsArr = [parsed];
    }
  } catch {
    sectionsArr = [];
  }
  if (sectionsArr.length === 0) {
    sectionsArr = ["NewArrivals"];
  }

  /* ---------- Shipping Regions ---------- */
  const shippingRegions = String(body.shippingRegions || "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  /* ---------- SKU Generation ---------- */
  let generatedSKU;
  if (typeof body.sku === "string" && body.sku.trim()) {
    generatedSKU = body.sku.trim().toUpperCase();
  } else {
    const catPrefix = categoryDoc.name?.slice(0, 3).toUpperCase() || "GEN";
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    generatedSKU = `MK-${catPrefix}-${dateCode}-${rand}`;
  }

  // Ensure unique SKU
  let uniqueSKU = generatedSKU;
  while (await Product.findOne({ sku: uniqueSKU })) {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    uniqueSKU = `${generatedSKU}-${rand}`;
  }

  /* ---------- Payload ---------- */
  const payload = {
    sku: uniqueSKU,
    name: name.trim(),
    description: description.trim(),
    category,
    supplier: supplier._id,
    price: Number(price),
    oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
    brand: body.brand?.trim(),
    stock: stockValue,
    weight: body.weight ? Number(body.weight) : null,
    dimensions,
    images: successfulUploads,
    sections: sectionsArr,
    shippingRegions,
    deliveryTime: body.deliveryTime?.trim(),
    freeShipping: Boolean(body.freeShipping),
    warehouseLocation: body.warehouseLocation?.trim(),
    returnPolicy: body.returnPolicy?.trim(),
    warranty: body.warranty?.trim(),
    flashSale: {
      isActive: !!flashSale?.isActive,
      discountPercentage: flashSale?.discountPercentage ?? 0,
      startDate: flashSale?.startDate ?? null,
      endDate: flashSale?.endDate ?? null,
    },
    variants,
    status: "pending",
    visibility: "private",
  };

  /* ---------- Save ---------- */
  const product = await Product.create(payload);

  supplier.products = supplier.products || [];
  supplier.products.push(product._id);
  await supplier.save();

  res.status(201).json({
    status: "success",
    message: "Product submitted for admin approval.",
    data: product,
  });
});

/* ---------- update product ---------- */
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

  // permission check
  if (
    req.user.role !== "Admin" &&
    product.supplier.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("You are not authorized to update this product.");
  }

  const updates = { ...(req.body || {}) };

  // parse variants if provided
  if (updates.variants) {
    const parsed = parseJSON(updates.variants) || updates.variants;
    if (!validateVariants(parsed)) {
      res.status(400);
      throw new Error("Invalid variants data.");
    }
    updates.variants = parsed;
  }

  // dimensions validation
  if (updates.dimensions && !validateDimensions(updates.dimensions)) {
    res.status(400);
    throw new Error("Invalid dimensions.");
  }

  // flashSale validation
  if (updates.flashSale) {
    const fs = parseJSON(updates.flashSale) || updates.flashSale;
    if (
      fs.startDate &&
      fs.endDate &&
      new Date(fs.endDate) <= new Date(fs.startDate)
    ) {
      res.status(400);
      throw new Error("Flash sale endDate must be after startDate.");
    }
    updates.flashSale = fs;
  }

  // handle incoming images
  if (req.files && req.files.length) {
    const uploadResults = await Promise.allSettled(
      req.files.map((f) => uploadToCloudinary(f.buffer))
    );
    const newImages = uploadResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);
    updates.images = [...(product.images || []), ...newImages];
  }

  // Admin approval shortcut: if admin marks approved -> active/public
  if (req.user.role === "Admin" && updates.status === "approved") {
    updates.status = "active";
    updates.visibility = "public";
  }

  // assign allowed updates only (avoid accidental overwrites)
  const allowed = [
    "name",
    "description",
    "price",
    "oldPrice",
    "brand",
    "stock",
    "weight",
    "dimensions",
    "images",
    "sections",
    "shippingRegions",
    "deliveryTime",
    "freeShipping",
    "warehouseLocation",
    "returnPolicy",
    "warranty",
    "flashSale",
    "variants",
    "status",
    "visibility",
    "tags",
    "discountType",
    "discountValue",
    "taxRate",
    "sku",
    "barcode",
    "flags",
    "seo",
  ];
  for (const [k, v] of Object.entries(updates)) {
    if (allowed.includes(k) && v != null) product.set(k, v);
  }

  const updated = await product.save();
  res.json({
    status: "success",
    message: "Product updated successfully.",
    data: updated,
  });
});

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

  if (isValidObjectId(idOrSlug)) {
    product = await Product.findOne({ _id: idOrSlug, deletedAt: null })
      .populate("category supplier", "name shopName")
      .lean();
  }

  if (!product) {
    product = await Product.findOne({ "seo.slug": idOrSlug, deletedAt: null })
      .populate("category supplier", "name shopName")
      .lean();
  }

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  res.json({ status: "success", data: product });
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

/* ---------- homepage sections ---------- */
export const getHomepageProducts = asyncHandler(async (req, res) => {
  const sections = ALLOWED_SECTIONS;
  const result = {};

  // fetch per section concurrently
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
