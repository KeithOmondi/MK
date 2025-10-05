import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controller/addressController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(isAuthenticated); // protect all routes

router.get("/get", isAuthenticated, getAddresses);
router.post("/add", isAuthenticated, addAddress);
router.put("/update/:id", isAuthenticated, updateAddress);
router.delete("/delete:id", isAuthenticated, deleteAddress);

export default router;
