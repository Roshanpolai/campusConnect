import express from "express";
import {
  getMyNotifications,
  markNotificationRead,
  createNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markNotificationRead);
router.post("/", protect, authorize("super_admin"), createNotification);

export default router;
