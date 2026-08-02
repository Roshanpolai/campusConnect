import mongoose from "mongoose";

const lostFoundSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["lost", "found"], required: true },
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: "" },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    contactInfo: { type: String, required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["open", "returned"], default: "open" },
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("LostFoundItem", lostFoundSchema);
