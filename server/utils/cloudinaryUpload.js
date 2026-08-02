import crypto from "crypto";
import { Readable } from "stream";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

// function sanitizeFilename(name) {
//   return name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_");
// }


function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}


export function uploadImageToCloudinary(buffer, folder) {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(new Error("Cloudinary is not configured (set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env)"));
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `campusconnect/${folder}`, resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

// Uploads any non-video downloadable file (PDF, Word, PowerPoint, ZIP) as a
// Cloudinary "raw" asset — notes, PYQs, timetables, resumes, certificates.
// resource_type is pinned to "raw" (never "video").
export function uploadRawToCloudinary(buffer, folder, originalName) {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(new Error("Cloudinary is not configured (set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env)"));
  }

  const publicId = `${crypto.randomUUID()}-${sanitizeFilename(originalName)}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `campusconnect/${folder}`, resource_type: "raw", public_id: publicId },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function deleteFromCloudinary(publicId, resourceType = "image") {
  if (!isCloudinaryConfigured() || !publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
