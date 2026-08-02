import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["event", "job", "marketplace", "announcement"],
      default: "announcement",
    },
    audience: {
      type: String,
      enum: ["Everyone", "Students", "Job Posters", "Event Coordinators"],
      default: "Everyone",
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
