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

// ✅ Register supplier → Authenticated user (NOT admin-only)
router.post(
  "/register",
  isAuthenticated,
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "businessLicense", maxCount: 1 },
  ]),
  registerSupplier
);

// ✅ Get all suppliers → Admin only
router.get("/get", isAuthenticated, isAuthorized("Admin"), getSuppliers);

// ✅ Get single supplier → Public or Authenticated
router.get("/get/:id", getSupplierById);

// ✅ Update supplier → Supplier themselves or Admin
router.put(
  "/update/:id",
  isAuthenticated,
  isAuthorized("Admin", "Supplier"),
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "businessLicense", maxCount: 1 },
  ]),
  updateSupplier
);

// ✅ Delete supplier → Admin only
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteSupplier
);

export default router;
