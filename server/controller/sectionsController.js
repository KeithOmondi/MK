import asyncHandler from "express-async-handler";
import Section from "../models/Section.js";
import Product from "../models/Product.js";

/* ======================================================
   ✅ 1. Get all homepage sections
====================================================== */
export const getSectionsList = asyncHandler(async (req, res) => {
  const sections = await Section.find().sort({ order: 1 }); // optional order field

  res.status(200).json({
    status: "success",
    count: sections.length,
    data: sections,
  });
});

/* ======================================================
   ✅ 2. Get products within a specific section
====================================================== */
export const getSectionProducts = asyncHandler(async (req, res) => {
  const { sectionName } = req.params;
  const limit = Number(req.query.limit) || 10;
  const sort = req.query.sort || "latest";

  const section = await Section.findOne({ name: sectionName });
  if (!section) {
    res.status(404);
    throw new Error("Section not found.");
  }

  const filter = {
    _id: { $in: section.products },
    visibility: "public",
    status: "approved",
  };

  let sortOption = { createdAt: -1 };
  switch (sort) {
    case "priceLowHigh":
      sortOption = { price: 1 };
      break;
    case "priceHighLow":
      sortOption = { price: -1 };
      break;
    case "random":
      sortOption = { random: 1 };
      break;
  }

  let products;
  if (sort === "random") {
    products = await Product.aggregate([
      { $match: filter },
      { $sample: { size: limit } },
    ]);
  } else {
    products = await Product.find(filter)
      .populate("category", "name")
      .populate("supplier", "name")
      .sort(sortOption)
      .limit(limit)
      .lean();
  }

  res.status(200).json({
    status: "success",
    section: sectionName,
    count: products.length,
    data: products,
  });
});

/* ======================================================
   ✅ 3. Create a new section
====================================================== */
export const createSection = asyncHandler(async (req, res) => {
  const { name, title, description, order } = req.body;

  const existing = await Section.findOne({ name });
  if (existing) {
    res.status(400);
    throw new Error("Section with this name already exists.");
  }

  const section = await Section.create({
    name,
    title,
    description,
    order: order || 0,
  });

  res.status(201).json({
    status: "success",
    message: "Section created successfully.",
    data: section,
  });
});

/* ======================================================
   ✅ 4. Add a product to a section
====================================================== */
export const addProductToSection = asyncHandler(async (req, res) => {
  const { sectionName, productId } = req.params;

  const section = await Section.findOne({ name: sectionName });
  if (!section) {
    res.status(404);
    throw new Error("Section not found.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  // Add product to section
  if (!section.products.includes(product._id)) {
    section.products.push(product._id);
    await section.save();
  }

  // Optionally tag product
  if (!product.sections.includes(sectionName)) {
    product.sections.push(sectionName);
    await product.save();
  }

  res.status(200).json({
    status: "success",
    message: `Product added to ${sectionName} section.`,
    data: { section, product },
  });
});

/* ======================================================
   ✅ 5. Remove a product from a section
====================================================== */
export const removeProductFromSection = asyncHandler(async (req, res) => {
  const { sectionName, productId } = req.params;

  const section = await Section.findOne({ name: sectionName });
  if (!section) {
    res.status(404);
    throw new Error("Section not found.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  section.products = section.products.filter(
    (p) => p.toString() !== productId
  );
  await section.save();

  product.sections = product.sections.filter((s) => s !== sectionName);
  await product.save();

  res.status(200).json({
    status: "success",
    message: `Product removed from ${sectionName} section.`,
    data: { section, product },
  });
});

/* ======================================================
   ✅ 6. Delete a section entirely
====================================================== */
export const deleteSection = asyncHandler(async (req, res) => {
  const { sectionName } = req.params;

  const section = await Section.findOneAndDelete({ name: sectionName });
  if (!section) {
    res.status(404);
    throw new Error("Section not found.");
  }

  // Remove section reference from products
  await Product.updateMany(
    { sections: sectionName },
    { $pull: { sections: sectionName } }
  );

  res.status(200).json({
    status: "success",
    message: `Section "${sectionName}" deleted successfully.`,
  });
});
