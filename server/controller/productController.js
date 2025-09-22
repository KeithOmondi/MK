import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadToCloudinary.js";
import Supplier from "../models/Supplier.js";
import Category from "../models/Category.js";

// ==============================
// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin/Supplier)
// ==============================
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    stock,
    status: productStatus,
    brand,
    color,
    size,
    isFlashSale,
    flashSaleEndDate,
    isDealOfWeek,
    dealEndDate,
    isNewArrival,
    newArrivalExpiry,
    weight,
    dimensions,
    shippingRegions,
    deliveryTime,
    freeShipping,
    warehouseLocation,
    returnPolicy,
    warranty,
  } = req.body;

  const supplier = await Supplier.findOne({ user: req.user._id });
  if (!supplier && req.user.role !== "Admin") {
    res.status(403);
    throw new Error("You must register as a supplier first");
  }

  let imageUrls = [];
  if (req.files?.length > 0) {
    const uploadResults = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer))
    );
    imageUrls = uploadResults;
  }

  const product = new Product({
    name,
    description,
    category,
    price,
    stock,
    brand,
    color,
    size,
    images: imageUrls,
    supplier: supplier ? supplier._id : null,
    status: productStatus || "active",
    isFlashSale,
    flashSaleEndDate,
    isDealOfWeek,
    dealEndDate,
    isNewArrival,
    newArrivalExpiry,
    weight,
    dimensions,
    shippingRegions: shippingRegions ? shippingRegions.split(",") : [],
    deliveryTime,
    freeShipping,
    warehouseLocation,
    returnPolicy,
    warranty,
  });

  const createdProduct = await product.save();

  if (supplier) {
    supplier.products.push(createdProduct._id);
    await supplier.save();
  }

  res.status(201).json(createdProduct);
});
// ==============================
// @desc    Get products (all, filtered, paginated, or by slug)
// @route   GET /api/products
// @access  Public
// ==============================
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const { parentSlug, childSlug } = req.params; // ✅ FIXED: params instead of query

  // keyword search
  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};

  let categoryFilter = {};

  if (parentSlug) {
    // find parent
    const parent = await Category.findOne({ slug: parentSlug, parentCategory: null });
    if (!parent) {
      return res.json({ products: [], page: 1, pages: 1, total: 0 });
    }

    if (childSlug) {
      // find child inside parent
      const child = await Category.findOne({
        slug: childSlug,
        parentCategory: parent._id,
      });
      if (!child) {
        return res.json({ products: [], page: 1, pages: 1, total: 0 });
      }
      categoryFilter = { category: child._id };
    } else {
      // all children of parent
      const children = await Category.find({ parentCategory: parent._id });
      categoryFilter = { category: { $in: children.map((c) => c._id) } };
    }
  } else if (req.query.category) {
    categoryFilter = { category: req.query.category };
  }

  // price range
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : Number.MAX_SAFE_INTEGER;
  const priceFilter = { price: { $gte: minPrice, $lte: maxPrice } };

  const filter = { ...keyword, ...categoryFilter, ...priceFilter };

  // sorting
  let sort = {};
  switch (req.query.sortBy) {
    case "priceAsc":
      sort = { price: 1 };
      break;
    case "priceDesc":
      sort = { price: -1 };
      break;
    case "newest":
      sort = { createdAt: -1 };
      break;
    case "oldest":
      sort = { createdAt: 1 };
      break;
  }

  const count = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category supplier", "name shopName")
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// ==============================
// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
// ==============================
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category supplier");
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

// ==============================
// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Supplier)
// ==============================
export const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    stock,
    status: productStatus,
    brand,
    color,
    size,
    isFlashSale,
    flashSaleEndDate,
    isDealOfWeek,
    dealEndDate,
    isNewArrival,
    newArrivalExpiry,
    weight,
    dimensions,
    shippingRegions,
    deliveryTime,
    freeShipping,
    warehouseLocation,
    returnPolicy,
    warranty,
  } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.name = name || product.name;
  product.description = description || product.description;
  product.category = category || product.category;
  product.price = price || product.price;
  product.stock = stock ?? product.stock;
  product.status = productStatus || product.status;

  // 🆕 brand, color, size
  product.brand = brand || product.brand;
  product.color = color || product.color;
  product.size = size || product.size;

  product.isFlashSale = isFlashSale ?? product.isFlashSale;
  product.flashSaleEndDate = flashSaleEndDate || product.flashSaleEndDate;
  product.isDealOfWeek = isDealOfWeek ?? product.isDealOfWeek;
  product.dealEndDate = dealEndDate || product.dealEndDate;
  product.isNewArrival = isNewArrival ?? product.isNewArrival;
  product.newArrivalExpiry = newArrivalExpiry || product.newArrivalExpiry;

  product.weight = weight ?? product.weight;
  product.dimensions = dimensions || product.dimensions;
  product.shippingRegions = shippingRegions
    ? shippingRegions.split(",")
    : product.shippingRegions;
  product.deliveryTime = deliveryTime || product.deliveryTime;
  product.freeShipping = freeShipping ?? product.freeShipping;
  product.warehouseLocation = warehouseLocation || product.warehouseLocation;
  product.returnPolicy = returnPolicy || product.returnPolicy;
  product.warranty = warranty || product.warranty;

  if (req.files?.length > 0) {
    const uploadResults = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer))
    );
    product.images = [...product.images, ...uploadResults];
  }

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// ==============================
// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin/Supplier)
// ==============================
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();
  res.json({ message: "Product removed" });
});

// ==============================
// @desc    Delete product image
// @route   DELETE /api/products/:productId/images/:publicId
// @access  Private (Admin/Supplier)
// ==============================
export const deleteProductImage = asyncHandler(async (req, res) => {
  const { productId, publicId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const image = product.images.find((img) => img.public_id === publicId);
  if (!image) {
    res.status(404);
    throw new Error("Image not found in this product");
  }

  await deleteFromCloudinary(publicId);
  product.images = product.images.filter((img) => img.public_id !== publicId);
  await product.save();

  res.json({ message: "Image deleted successfully", product });
});

// ==============================
// @desc    Homepage products
// @route   GET /api/products/homepage
// @access  Public
// ==============================
export const getHomepageProducts = asyncHandler(async (req, res) => {
  const now = new Date();

  const flashSales = await Product.find({
    isFlashSale: true,
    flashSaleEndDate: { $gte: now },
    status: "active",
  }).limit(10);

  const deals = await Product.find({
    isDealOfWeek: true,
    dealEndDate: { $gte: now },
    status: "active",
  }).limit(10);

  const newArrivals = await Product.find({
    isNewArrival: true,
    newArrivalExpiry: { $gte: now },
    status: "active",
  }).limit(10);

  res.json({ flashSales, deals, newArrivals });
});
