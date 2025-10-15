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
  getProductsBySection,
  getSupplierProducts,
  getRelatedProducts,
} from "../controller/productController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

/* =========================================================
   🛒 Create Product (Supplier Only)
   POST /api/v1/products/create
========================================================= */
router.post(
  "/create",
  isAuthenticated,
  isAuthorized("Supplier"),

  // ✅ Ensure correct Content-Type
  (req, res, next) => {
    if (!req.is("multipart/form-data")) {
      return res.status(400).json({
        success: false,
        message: "Content-Type must be multipart/form-data",
      });
    }
    next();
  },

  // ✅ Multer handles up to 5 images
  upload.array("images", 5),

  createProduct
);

/* =========================================================
   🌍 Public: List Products (search, filter, pagination)
   GET /api/v1/products/get
========================================================= */
router.get("/get", getProducts);

/* =========================================================
   🧑‍💼 Admin: Get All Products
   GET /api/v1/products/admin/get
========================================================= */
router.get(
  "/admin/get",
  isAuthenticated,
  isAuthorized("Admin"),
  getAllProductsForAdmin
);

/* =========================================================
   📦 Get Products by Category
   GET /api/v1/products/category/:id
========================================================= */
router.get("/category/:id", getProductsByCategory);

/* =========================================================
   🏠 Homepage Sections (Featured, Trending, etc.)
   GET /api/v1/products/homepage
========================================================= */
router.get("/homepage", getHomepageProducts);

/* =========================================================
   🔥 Get Products by Section (e.g. /NewArrivals)
   GET /api/v1/products/section/:section
========================================================= */
router.get("/section/:section", getProductsBySection);

/* =========================================================
   🔍 Get Single Product
   GET /api/v1/products/get/:id
========================================================= */
router.get("/get/:id", getProductById);

/* =========================================================
   ✏️ Update Product (Supplier or Admin)
   PUT /api/v1/products/update/:id
========================================================= */
router.put(
  "/update/:id",
  isAuthenticated,
  isAuthorized("Supplier", "Admin"),
  upload.array("images", 5),
  updateProduct
);

/* =========================================================
   ❌ Delete Product (Soft Delete)
   DELETE /api/v1/products/delete/:id
========================================================= */
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Supplier", "Admin"),
  deleteProduct
);

/* =========================================================
   🖼️ Delete Single Product Image
   DELETE /api/v1/products/delete/:productId/images/:publicId
========================================================= */
router.delete(
  "/delete/:productId/images/:publicId",
  isAuthenticated,
  isAuthorized("Supplier", "Admin"),
  deleteProductImage
);

/* =========================================================
   🧑‍🏭 Supplier: Get Their Own Products
   GET /api/v1/products/supplier
========================================================= */
router.get(
  "/supplier",
  isAuthenticated,
  isAuthorized("Supplier"),
  getSupplierProducts
);

// ✅ New route for related products
router.get("/related", getRelatedProducts);


export default router;
