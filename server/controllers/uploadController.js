import asyncHandler from "../middleware/asyncHandler.js";
import {
  uploadImageToCloudinary,
  uploadRawToCloudinary,
} from "../utils/cloudinaryUpload.js";

// Uploads an image (profile photo, event banner, gallery photo, product)
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image file provided");
  }

  const folder = (req.query.folder || "general").replace(/[^a-z0-9_-]/gi, "");
  const result = await uploadImageToCloudinary(req.file.buffer, folder);

  res.status(201).json({
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
  });
});

// Uploads (PDF, Word, PowerPoint, ZIP) as a raw asset
export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file provided");
  }

  const folder = (req.query.folder || "documents").replace(/[^a-z0-9_-]/gi, "");
  const result = await uploadRawToCloudinary(
    req.file.buffer,
    folder,
    req.file.originalname,
  );

  res.status(201).json({
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    fileType: req.file.mimetype,
  });
});
