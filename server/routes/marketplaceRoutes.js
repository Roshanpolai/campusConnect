import express from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleSaveProduct,
  moderateProduct,
} from "../controllers/marketplaceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getProducts);
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);
router.put("/:id/save", protect, toggleSaveProduct);
router.put("/:id/moderate", protect, authorize("moderator", "super_admin"), moderateProduct);

export default router;
