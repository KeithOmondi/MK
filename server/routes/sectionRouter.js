import express from "express";
import {
  getSectionsList,
  getSectionProducts,
  createSection,
  addProductToSection,
  removeProductFromSection,
  deleteSection,
} from "../controller/sectionsController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/get", getSectionsList);
router.get("/get/:sectionName/products", getSectionProducts);

// Admin routes
router.post("/create", isAuthenticated, isAuthorized('Supplier'), createSection);
router.post(
  "/:sectionName/add/:productId",
  isAuthenticated, isAuthorized('Supplier'),
  addProductToSection
);
router.delete(
  "/:sectionName/remove/:productId",
  isAuthenticated, isAuthorized('Supplier'),
  removeProductFromSection
);
router.delete("/:sectionName", isAuthenticated, isAuthorized('Supplier'), deleteSection);

export default router;
