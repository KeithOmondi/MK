import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getHomepageProducts,
} from "../controller/productController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// ✅ Create product → Admin or Supplier
router.post(
  "/create",
  isAuthenticated,
  isAuthorized("Admin", "Supplier"),
  upload.array("images", 5),
  createProduct
);

// ✅ Get all products (query-based filters + pagination)
router.get("/get", getProducts);

// ✅ Get products by category slug
router.get("/category/:parentSlug", getProducts);
router.get("/category/:parentSlug/:childSlug", getProducts);

// ✅ Get homepage featured products (FlashSales, Deals, New Arrivals)
router.get("/homepage", getHomepageProducts);

// ✅ Get single product
router.get("/get/:id", getProductById);

// ✅ Update product
router.put(
  "/update/:id",
  isAuthenticated,
  isAuthorized("Admin", "Supplier"),
  upload.array("images", 5),
  updateProduct
);

// ✅ Delete product
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Admin", "Supplier"),
  deleteProduct
);

// ✅ Delete single product image
router.delete(
  "/delete/:productId/images/:publicId",
  isAuthenticated,
  isAuthorized("Admin", "Supplier"),
  deleteProductImage
);

export default router;
