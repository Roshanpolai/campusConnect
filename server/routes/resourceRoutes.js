import express from "express";
import {
  createResource,
  getResources,
  getMyResources,
  getPendingResources,
  approveResource,
  rejectResource,
  deleteResource,
  trackDownload,
} from "../controllers/resourceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
const canModerate = authorize("moderator", "super_admin");

router.get("/", protect, getResources);
router.get("/mine", protect, getMyResources);
router.get("/pending", protect, canModerate, getPendingResources);
router.post("/", protect, createResource);
router.put("/:id/approve", protect, canModerate, approveResource);
router.put("/:id/reject", protect, canModerate, rejectResource);
router.put("/:id/download", protect, trackDownload);
router.delete("/:id", protect, deleteResource);

export default router;
