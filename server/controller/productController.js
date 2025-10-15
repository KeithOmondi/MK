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
  if (!val) return null;
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch {
    return val; // fallback to raw string if not JSON
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
  const files = Array.isArray(req.files) ? req.files : [];

  console.log("📥 Incoming createProduct body:", body);

  const { name, description, category, price } = body;
  if (!name || !description || !category || price == null) {
    res.status(400);
    throw new Error("Name, description, category, and price are required.");
  }

  /* ---------- ✅ Handle Category (id | slug | name) ---------- */
  let categoryDoc = null;
  if (mongoose.Types.ObjectId.isValid(category)) {
    categoryDoc = await Category.findById(category);
  } else {
    categoryDoc = await Category.findOne({
      $or: [{ slug: category }, { name: category }],
    });
  }

  if (!categoryDoc) {
    res.status(400);
    throw new Error("Invalid category ID or name.");
  }

  /* ---------- ✅ Get Supplier ---------- */
  const supplier = await Supplier.findOne({ user: req.user._id }).select("_id");
  if (!supplier) {
    res.status(403);
    throw new Error("You must register as a supplier first.");
  }

  /* ---------- ✅ Safely parse possible JSON strings ---------- */
  const parseMaybe = (val, fallback = null) => {
    if (!val) return fallback;
    if (typeof val === "object") return val;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  const dimensions = parseMaybe(body.dimensions, { length: 0, width: 0, height: 0 });
  const variants = Array.isArray(body.variants)
    ? body.variants.map(v => parseMaybe(v, {}))
    : parseMaybe(body.variants, []);

  const shippingRegions = parseMaybe(body.shippingRegions, []);
  const tags = parseMaybe(body.tags, []);
  const seo = parseMaybe(body.seo, {});
  const flashSale = parseMaybe(body.flashSale, {});
  const flags = parseMaybe(body.flags, {});
  const sectionsParsed = parseMaybe(body.sections, []);

  const sectionsArr = (() => {
    if (Array.isArray(sectionsParsed))
      return sectionsParsed.filter(s => ALLOWED_SECTIONS.includes(s));
    if (typeof sectionsParsed === "string" && ALLOWED_SECTIONS.includes(sectionsParsed))
      return [sectionsParsed];
    return ["NewArrivals"];
  })();

  /* ---------- ✅ Compute Stock ---------- */
  let stockValue = Number(body.stock) || 0;
  if (Array.isArray(variants) && variants.length > 0) {
    const totalStock = variants.reduce((a, v) => a + (Number(v.stock) || 0), 0);
    if (totalStock > 0) stockValue = totalStock;
  }

  /* ---------- ✅ Upload Images ---------- */
  const uploadResults = await Promise.allSettled(
    files.map(f => uploadToCloudinary(f.buffer))
  );
  const successfulUploads = uploadResults
    .filter(r => r.status === "fulfilled")
    .map(r => r.value);

  /* ---------- ✅ Generate SKU ---------- */
  const catPrefix = categoryDoc.name?.slice(0, 3).toUpperCase() || "GEN";
  const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const generatedSKU = `MK-${catPrefix}-${dateCode}-${rand}`;

  /* ---------- ✅ Final Payload ---------- */
  const payload = {
    name,
    description,
    category: categoryDoc._id,
    supplier: supplier._id,
    price: Number(price),
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
    shippingRegions,
    deliveryTime: body.deliveryTime || "",
    freeShippingThreshold: Number(body.freeShippingThreshold) || 5000,
    warehouseLocation: body.warehouseLocation || "",
    returnPolicy: body.returnPolicy || "",
    warranty: body.warranty || "",
    flashSale,
    tags,
    discountType: body.discountType || "none",
    discountValue: Number(body.discountValue) || 0,
    taxRate: Number(body.taxRate) || 0,
    barcode: body.barcode || "",
    flags,
    seo,
  };

  /* ---------- ✅ Create Product ---------- */
  const product = await Product.create(payload);

  res.status(201).json({
    status: "success",
    message: "Product created successfully and pending admin review.",
    data: product,
  });
});
;


export const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;

  // --- Validate product ID ---
  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID." });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  // --- Access control ---
  if (req.user.role !== "Admin" && product.supplier.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "You are not authorized to update this product." });
  }

  const updates = { ...(req.body || {}) };

  // --- Normalize all JSON-like fields from FormData ---
  const jsonFields = ["variants", "dimensions", "seo", "flashSale", "sections", "shippingRegions", "tags"];
  for (const field of jsonFields) {
    if (updates[field]) {
      updates[field] = safeJSON(updates[field]) || updates[field];
    }
  }

  // --- Validate complex structures ---
  if (updates.variants && !validateVariants(updates.variants)) {
    return res.status(400).json({ success: false, message: "Invalid variants data." });
  }

  if (updates.dimensions && !validateDimensions(updates.dimensions)) {
    return res.status(400).json({ success: false, message: "Invalid dimensions data." });
  }

  if (updates.flashSale) {
    const { startDate, endDate } = updates.flashSale;
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ success: false, message: "Flash sale end date must be after start date." });
    }
  }

  // --- Handle new uploaded images (if any) ---
  if (req.files && req.files.length > 0) {
    const uploadResults = await Promise.allSettled(
      req.files.map(async (file) => await uploadToCloudinary(file.buffer))
    );
    const successfulUploads = uploadResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    if (successfulUploads.length > 0) {
      updates.images = [...(product.images || []), ...successfulUploads];
    }
  }

  // --- Auto-approve shortcut for Admin ---
  if (req.user.role === "Admin" && updates.status === "approved") {
    updates.status = "active";
    updates.visibility = "public";
  }

  // --- Only allow safe keys to be modified ---
  const allowedFields = [
    "name","description","price","oldPrice","brand","stock","weight","dimensions","images",
    "sections","shippingRegions","deliveryTime","freeShippingThreshold","warehouseLocation",
    "returnPolicy","warranty","flashSale","variants","status","visibility","tags",
    "discountType","discountValue","taxRate","sku","barcode","flags","seo","fragility"
  ];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined && value !== null) {
      product.set(key, value);
    }
  }

  // --- Save & respond ---
  const updatedProduct = await product.save();
  return res.status(200).json({
    success: true,
    message: "✅ Product updated successfully.",
    data: updatedProduct,
  });
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

  if (req.query.supplierId && isValidObjectId(req.query.supplierId)) {
    filters.supplier = req.query.supplierId;
  }

  if (req.query.category && isValidObjectId(req.query.category)) {
    filters.category = req.query.category;
  } else if (req.query.category) {
    filters["category"] = req.query.category;
  }

  if (req.query.section) filters.sections = req.query.section;

  if (req.query.q) {
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


export const getSupplierProducts = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role.toLowerCase() !== "supplier") {
    return res.status(403).json({ success: false, message: "Only suppliers can access their products" });
  }

  // ✅ fetch Supplier ID linked to this user
  const supplier = await Supplier.findOne({ user: req.user._id }).select("_id");
  if (!supplier) {
    return res.status(404).json({ success: false, message: "Supplier not found" });
  }

  const supplierId = supplier._id;

  // Pagination & search
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 100);
  const skip = (page - 1) * limit;

  const filters = { supplier: supplierId, deletedAt: null }; // <- removed ": any"
  if (req.query.q) filters.$text = { $search: req.query.q };

  const total = await Product.countDocuments(filters);
  const products = await Product.find(filters)
    .populate("category", "name")
    .populate("supplier", "shopName name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: products,
  });
});

/**
 * @desc    Get related products by category (excluding current product)
 * @route   GET /api/v1/products/related
 * @access  Public
 */
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { category, exclude, limit = 6 } = req.query;

  if (!category) {
    res.status(400);
    throw new Error("Category parameter is required.");
  }

  const filter = {
    "category": category, // works whether it's string or ObjectId
    "_id": { $ne: exclude }, // exclude current product
  };

  // 🔍 Populate category and supplier if needed
  const related = await Product.find(filter)
    .limit(Number(limit))
    .populate("category", "name")
    .populate("supplier", "name email");

  res.status(200).json({
    success: true,
    count: related.length,
    products: related,
  });
});




