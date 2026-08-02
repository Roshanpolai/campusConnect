import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    companyLogo: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    jobType: { type: String, enum: ["Internship", "Full Time", "Remote", "Freelance", "Referral"], required: true },
    workMode: { type: String, enum: ["Onsite", "Remote", "Hybrid"], required: true },
    location: { type: String, required: true },
    salary: { type: String, required: true },
    eligibility: { type: String, required: true },
    deadline: { type: Date, required: true },
    applicationLink: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["active", "expired"], default: "active" },
    pinned: { type: Boolean, default: false },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reportedCount: { type: Number, default: 0 },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
