import express from "express";
import { addRecentlyViewed, getRecentlyViewed } from "../controller/recentlyViewedController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js"
const router = express.Router();

// POST /api/recently-viewed/:productId
router.post("/add/:productId", isAuthenticated, addRecentlyViewed);

// GET /api/recently-viewed
router.get("/get", isAuthenticated, getRecentlyViewed);

export default router;
