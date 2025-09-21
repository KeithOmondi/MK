import express from "express";
import {
  registerSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../controller/supplierController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// -------------------------
// Register Supplier
// -------------------------
router.post(
  "/register",
  isAuthenticated,
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "businessLicense", maxCount: 1 },
    { name: "passportPhoto", maxCount: 1 }, 
  ]),
  registerSupplier
);

// -------------------------
// Get Suppliers
// -------------------------
router.get("/get", isAuthenticated, isAuthorized("Admin"), getSuppliers);
router.get("/get/:id", getSupplierById);

// -------------------------
// Update Supplier
// -------------------------
// Include file uploads in update route as well
router.put(
  "/update/:id",
  isAuthenticated,
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "businessLicense", maxCount: 1 },
  ]),
  updateSupplier
);

// -------------------------
// Delete Supplier
// -------------------------
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteSupplier
);

export default router;
