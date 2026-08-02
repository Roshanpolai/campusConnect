import express from "express";
import {
  getLostFoundItems,
  createLostFoundItem,
  deleteLostFoundItem,
  moderateLostFoundItem,
} from "../controllers/lostFoundController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getLostFoundItems);
router.post("/", protect, createLostFoundItem);
router.delete("/:id", protect, deleteLostFoundItem);
router.put("/:id/moderate", protect, authorize("moderator", "super_admin"), moderateLostFoundItem);

export default router;
