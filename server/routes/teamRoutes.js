import express from "express";
import { getTeams, createTeam, joinTeam } from "../controllers/teamController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getTeams);
router.post("/", protect, createTeam);
router.put("/:id/join", protect, joinTeam);

export default router;
