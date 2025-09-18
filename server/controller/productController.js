import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import Supplier from "../models/Supplier.js";

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin/Seller)
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, stock } = req.body;

  // 1️⃣ Check if user is a supplier
  const supplier = await Supplier.findOne({ user: req.user._id });
  if (!supplier && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You must register as a supplier first");
  }

  let imageUrls = [];

  // 2️⃣ Handle file uploads
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer)
    );
    const uploadResults = await Promise.all(uploadPromises);
    imageUrls = uploadResults; // contains [{ url, public_id }]
  }

  // 3️⃣ Create product (link supplier automatically)
  const product = new Product({
    name,
    description,
    category,
    price,
    stock,
    images: imageUrls,
    supplier: supplier ? supplier._id : null, // admin could bypass
  });

  const createdProduct = await product.save();

  // 4️⃣ Update supplier’s products array
  if (supplier) {
    supplier.products.push(createdProduct._id);
    await supplier.save();
  }

  res.status(201).json(createdProduct);
});


// @desc    Get all products with filters, search, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;   // Default 10 per page
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        name: { $regex: req.query.keyword, $options: "i" }, // case-insensitive search
      }
    : {};

  const categoryFilter = req.query.category
    ? { category: req.query.category }
    : {};

  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : Number.MAX_SAFE_INTEGER;

  const priceFilter = { price: { $gte: minPrice, $lte: maxPrice } };

  // Combine filters
  const filter = { ...keyword, ...categoryFilter, ...priceFilter };

  // Sorting
  let sort = {};
  if (req.query.sortBy) {
    if (req.query.sortBy === "priceAsc") sort = { price: 1 };
    if (req.query.sortBy === "priceDesc") sort = { price: -1 };
    if (req.query.sortBy === "newest") sort = { createdAt: -1 };
    if (req.query.sortBy === "oldest") sort = { createdAt: 1 };
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

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category supplier");

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Seller)
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, stock } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Update fields if provided
  product.name = name || product.name;
  product.description = description || product.description;
  product.category = category || product.category;
  product.price = price || product.price;
  product.stock = stock ?? product.stock;

  // Handle new file uploads
  if (req.files && req.files.length > 0) {
  const uploadPromises = req.files.map((file) =>
    uploadToCloudinary(file.buffer)
  );
  const uploadResults = await Promise.all(uploadPromises);
  const newImages = uploadResults;

  // Append new images
  product.images = [...product.images, ...newImages];
}


  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin/Seller)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete a single image from product
// @route   DELETE /api/products/:productId/images/:publicId
// @access  Private (Admin/Seller)
export const deleteProductImage = asyncHandler(async (req, res) => {
  const { productId, publicId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if image exists
  const image = product.images.find((img) => img.public_id === publicId);
  if (!image) {
    res.status(404);
    throw new Error("Image not found in this product");
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(publicId);

  // Remove from DB
  product.images = product.images.filter((img) => img.public_id !== publicId);
  await product.save();

  res.json({ message: "Image deleted successfully", product });
});

