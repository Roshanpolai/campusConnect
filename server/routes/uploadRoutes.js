import express from "express";
import { uploadImage as uploadImageMiddleware, uploadDocument as uploadDocumentMiddleware } from "../middleware/upload.js";
import { uploadImage, uploadDocument } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Wrap multer so its errors (bad type, too large) flow into the same JSON
// error shape as everything else, instead of an unhandled exception.
const withMulter = (middleware) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (err) {
      res.status(400).json({ success: false, message: err.message });
      return;
    }
    next();
  });
};

router.post("/image", protect, withMulter(uploadImageMiddleware), uploadImage);
router.post("/document", protect, withMulter(uploadDocumentMiddleware), uploadDocument);

export default router;
