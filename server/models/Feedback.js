import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    status: { type: String, enum: ["Pending", "Reviewed"], default: "Pending" },
    isSpam: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
