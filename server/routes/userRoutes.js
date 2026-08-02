import express from "express";
import {
  updateProfile,
  changePassword,
  deleteOwnAccount,
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.put("/me", protect, updateProfile);
router.put("/me/password", protect, changePassword);
router.delete("/me", protect, deleteOwnAccount);

router.get("/", protect, authorize("super_admin"), getUsers);
router.put("/:id/role", protect, authorize("super_admin"), updateUserRole);
router.put("/:id/status", protect, authorize("super_admin"), updateUserStatus);
router.delete("/:id", protect, authorize("super_admin"), deleteUser);

export default router;
