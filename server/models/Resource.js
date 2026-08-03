import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["Notes", "PYQ", "Academic Resource"], required: true },
    subject: { type: String, required: true, trim: true },
    department: { type: String, required: true },
    year: { type: String, required: true },
    section: { type: String, default: "" },
    semester: { type: String, default: "" },
    cloudinaryPublicId: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true }, // bytes
    fileType: { type: String, required: true }, // mimetype

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNote: { type: String, default: "" },
    reviewedAt: { type: Date },

    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resourceSchema.index({ department: 1, year: 1, subject: 1, status: 1 });

export default mongoose.model("Resource", resourceSchema);
