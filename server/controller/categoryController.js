// src/controllers/categoryController.js
import Category from "../models/Category.js";
import asyncHandler from "express-async-handler";
import slugify from "slugify";

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, parentCategory } = req.body;

  if (!name?.trim()) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const categoryExists = await Category.findOne({ name: name.trim() });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  // prevent circular assignment
  if (parentCategory && parentCategory === req.params?.id) {
    res.status(400);
    throw new Error("A category cannot be its own parent");
  }

  const category = new Category({
    name: name.trim(),
    slug: slugify(name, { lower: true }),
    parentCategory: parentCategory || null,
  });

  const createdCategory = await category.save();
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: createdCategory,
  });
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .populate("parentCategory", "name slug")
    .lean();

  res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate("parentCategory", "name slug")
    .lean();

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json({
    success: true,
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, parentCategory } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // prevent circular assignment
  if (parentCategory && parentCategory.toString() === category._id.toString()) {
    res.status(400);
    throw new Error("A category cannot be its own parent");
  }

  if (name) {
    category.name = name.trim();
    category.slug = slugify(name, { lower: true });
  }

  category.parentCategory = parentCategory || null;

  const updatedCategory = await category.save();
  res.json({
    success: true,
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Optional: prevent deleting parent category if it has children
  const child = await Category.findOne({ parentCategory: category._id });
  if (child) {
    res.status(400);
    throw new Error("Cannot delete a category that has subcategories");
  }

  await category.deleteOne();
  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});
