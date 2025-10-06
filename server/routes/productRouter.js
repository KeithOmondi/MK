import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getHomepageProducts,
  getAllProductsForAdmin,
  getProductsByCategory,
} from "../controller/productController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

/**
 * Supplier creates a product (awaiting admin review)
 * POST /api/v1/products/create
 */
router.post(
  "/create",
  isAuthenticated,
  isAuthorized("Supplier"),
  upload.array("images", 5),
  createProduct
);

/**
 * Public: list products (search, filters, pagination)
 * GET /api/v1/products/get
 */
router.get("/get", getProducts);

/**
 * Admin: list all products with filters
 * GET /api/v1/products/admin/get
 */
router.get("/admin/get", isAuthenticated, isAuthorized("Admin"), getAllProductsForAdmin);

/**
 * Get products by category id or slug/name
 * GET /api/v1/products/category/:id
 */
router.get("/category/:id", getProductsByCategory);

/**
 * Homepage featured sections
 * GET /api/v1/products/homepage
 */
router.get("/homepage", getHomepageProducts);

/**
 * Get single product by id or slug
 * GET /api/v1/products/get/:id
 */
router.get("/get/:id", getProductById);

/**
 * Update product (Supplier or Admin)
 * PUT /api/v1/products/update/:id
 */
router.put(
  "/update/:id",
  isAuthenticated,
  isAuthorized("Supplier", "Admin"),
  upload.array("images", 5),
  updateProduct
);

/**
 * Soft-delete: Supplier (their own) or Admin
 * DELETE /api/v1/products/delete/:id
 */
router.delete("/delete/:id", isAuthenticated, isAuthorized("Supplier", "Admin"), deleteProduct);

/**
 * Delete a single image from a product
 * DELETE /api/v1/products/delete/:productId/images/:publicId
 */
router.delete(
  "/delete/:productId/images/:publicId",
  isAuthenticated,
  isAuthorized("Supplier", "Admin"),
  deleteProductImage
);

export default router;
