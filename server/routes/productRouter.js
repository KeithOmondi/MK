import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
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

// ✅ Get all products → Public
router.get("/", getProducts);

// ✅ Get single product → Public
router.get("/:id", getProductById);

// ✅ Update product → Admin or Supplier
router.put(
  "/:id",
  isAuthenticated,
  isAuthorized("Admin", "Supplier"),
  upload.array("images", 5),
  updateProduct
);

// ✅ Delete product → Admin or Supplier
router.delete("/:id", isAuthenticated, isAuthorized("Admin", "Supplier"), deleteProduct);

// ✅ Delete single product image → Admin or Supplier
router.delete(
  "/:productId/images/:publicId",
  isAuthenticated,
  isAuthorized("Admin", "Supplier"),
  deleteProductImage
);

export default router;
