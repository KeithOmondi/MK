import express from "express";
import { getOffers } from "../controller/offersController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/get", isAuthenticated, getOffers);

export default router;
