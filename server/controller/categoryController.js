import Category from "../models/Category.js";
import asyncHandler from "express-async-handler";
import slugify from "slugify";

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, parentCategory } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = new Category({
    name,
    slug: slugify(name, { lower: true }),
    parentCategory: parentCategory || null,
  });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().populate("parentCategory");
  res.json(categories);
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate("parentCategory");

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json(category);
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

  category.name = name || category.name;
  category.slug = name ? slugify(name, { lower: true }) : category.slug;
  category.parentCategory = parentCategory || null;

  const updatedCategory = await category.save();
  res.json(updatedCategory);
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

  await category.deleteOne();
  res.json({ message: "Category deleted successfully" });
});
