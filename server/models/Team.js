import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    projectType: { type: String, required: true },
    requiredSkills: [{ type: String }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    maxMembers: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);
