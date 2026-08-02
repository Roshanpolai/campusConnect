import express from "express";
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  toggleSaveJob,
  reportJob,
  updateJobStatus,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
const canManage = authorize("job_poster", "super_admin");

router.get("/", protect, getJobs);
router.post("/", protect, canManage, createJob);
router.get("/:id", protect, getJobById);
router.put("/:id", protect, canManage, updateJob);
router.delete("/:id", protect, canManage, deleteJob);
router.put("/:id/save", protect, toggleSaveJob);
router.put("/:id/report", protect, reportJob);
router.put("/:id/status", protect, canManage, updateJobStatus);

export default router;
