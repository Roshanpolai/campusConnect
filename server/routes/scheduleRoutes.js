import express from "express";
import { getSchedule, getScheduleGroups, upsertSchedule, deleteSchedule } from "../controllers/scheduleController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
const canManage = authorize("super_admin");

router.get("/", protect, getSchedule);
router.get("/groups", protect, canManage, getScheduleGroups);
router.post("/", protect, canManage, upsertSchedule);
router.delete("/:id", protect, canManage, deleteSchedule);

export default router;
