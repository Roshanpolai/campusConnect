import multer from "multer";

const memoryStorage = multer.memoryStorage();

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "image/jpeg", // scanned notes are often photographed
  "image/png",
];

// Images only — used for profile photos, event banners, gallery, product/listing
// photos. Explicitly excludes video and everything else (Cloudinary handles images
// only in this app, per product requirements).
export const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!IMAGE_TYPES.includes(file.mimetype)) {
      return cb(
        new Error(
          "Only image files (jpg, png, webp, gif, svg) are allowed — video is not supported.",
        ),
      );
    }
    cb(null, true);
  },
}).single("image");

// Documents — used for notes, PYQs, resumes, certificates, zips
// No video here either.
export const uploadDocument = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      return cb(new Error("Video files are not supported."));
    }
    if (!DOCUMENT_TYPES.includes(file.mimetype)) {
      return cb(
        new Error(
          "Only PDF, Word, PowerPoint, ZIP, or image files are allowed.",
        ),
      );
    }
    cb(null, true);
  },
}).single("file");
