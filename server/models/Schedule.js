import mongoose from "mongoose";

// Schedule schema for storing uploaded schedule files (PDF, Word, PowerPoint, ZIP) in Cloudinary
const scheduleSchema = new mongoose.Schema(
  {
    department: { type: String, required: true },
    year: { type: String, required: true },
    section: { type: String, default: "", trim: true, uppercase: true },

    cloudinaryPublicId: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

scheduleSchema.index({ department: 1, year: 1, section: 1 }, { unique: true });

export default mongoose.model("Schedule", scheduleSchema);
