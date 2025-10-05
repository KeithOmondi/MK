import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getHomepageProducts,
  getAllProductsForAdmin, // new import
} from "../controller/productController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

/* ------------------------------------------------------------------
 🛒 PRODUCT ROUTES (PRODUCTION READY)
-------------------------------------------------------------------*/

/**
 * @route   POST /api/v1/products/create
 * @desc    Supplier creates a new product (awaiting admin review/approval)
 * @access  Supplier only
 */
router.post(
  "/create",
  isAuthenticated,
  isAuthorized("Supplier"),
  upload.array("images", 5),
  createProduct
);

/**
 * @route   GET /api/v1/products/get
 * @desc    Get all products (supports search, filters & pagination)
 * @access  Public
 */
router.get("/get", getProducts);

/**
 * @route   GET /api/v1/products/admin/get
 * @desc    Admin: get all products (pending, active, inactive) with filters
 * @access  Admin only
 */
router.get(
  "/admin/get",
  isAuthenticated,
  isAuthorized("Admin"),
  getAllProductsForAdmin
);

/**
 * @route   GET /api/v1/products/category/:slugs
 * @desc    Get products by any nested category slugs
 * @access  Public
 */
router.get("/category/:slugs", getProducts);

/**
 * @route   GET /api/v1/products/homepage
 * @desc    Get homepage featured sections (Flash Sales, Best Deals, etc.)
 * @access  Public
 */
router.get("/homepage", getHomepageProducts);

/**
 * @route   GET /api/v1/products/get/:id
 * @desc    Get a single product by ID or slug
 * @access  Public
 */
router.get("/get/:id", getProductById);

/**
 * @route   PUT /api/v1/products/update/:id
 * @desc    Supplier updates product details
 *          Admin can also update to approve or change status
 * @access  Supplier or Admin
 */
router.put(
  "/update/:id",
  isAuthenticated,
  isAuthorized("Supplier", "Admin"),
  upload.array("images", 5),
  updateProduct
);

/**
 * @route   DELETE /api/v1/products/delete/:id
 * @desc    Admin or Supplier can delete product
 * @access  Supplier (their own) | Admin (any)
 */
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Supplier", "Admin"),
  deleteProduct
);

/**
 * @route   DELETE /api/v1/products/delete/:productId/images/:publicId
 * @desc    Remove a single image from a product
 * @access  Supplier (their own) | Admin (any)
 */
router.delete(
  "/delete/:productId/images/:publicId",
  isAuthenticated,
  isAuthorized("Supplier", "Admin"),
  deleteProductImage
);

export default router;
