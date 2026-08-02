import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    banner: { type: String, default: "" },
    category: { type: String, enum: ["Technical", "Cultural", "Sports", "Workshop"], required: true },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    organizer: { type: String, required: true },
    registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

eventSchema.virtual("participantsCount").get(function participantsCount() {
  return this.registeredStudents?.length || 0;
});
eventSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Event", eventSchema);
