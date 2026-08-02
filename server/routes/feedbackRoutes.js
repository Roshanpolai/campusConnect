import express from "express";
import {
  getMyFeedback,
  createFeedback,
  getAllFeedback,
  markFeedbackReviewed,
  deleteFeedback,
} from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
const canModerate = authorize("moderator", "super_admin");

router.get("/mine", protect, getMyFeedback);
router.post("/", protect, createFeedback);

router.get("/", protect, canModerate, getAllFeedback);
router.put("/:id/reviewed", protect, canModerate, markFeedbackReviewed);
router.delete("/:id", protect, canModerate, deleteFeedback);

export default router;
