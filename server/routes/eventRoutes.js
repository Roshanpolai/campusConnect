import express from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleRegistration,
  getEventRegistrations,
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
const canManage = authorize("event_coordinator", "super_admin");

router.get("/", protect, getEvents);
router.post("/", protect, canManage, createEvent);
router.get("/:id", protect, getEventById);
router.put("/:id", protect, canManage, updateEvent);
router.delete("/:id", protect, canManage, deleteEvent);
router.put("/:id/register", protect, toggleRegistration);
router.get("/:id/registrations", protect, canManage, getEventRegistrations);

export default router;
