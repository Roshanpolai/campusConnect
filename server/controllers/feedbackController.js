import Feedback from "../models/Feedback.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @desc  Get logged-in student's own feedback history
// @route GET /api/feedback/mine
export const getMyFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ student: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, feedback });
});

export const createFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.create({ ...req.body, student: req.user._id });
  res.status(201).json({ success: true, feedback });
});

// ---------- Admin ----------

export const getAllFeedback = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status && status !== "All") query.status = status;
  const feedback = await Feedback.find(query).populate("student", "fullName email").sort({ createdAt: -1 });
  res.json({ success: true, feedback });
});

export const markFeedbackReviewed = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status: "Reviewed" }, { new: true });
  if (!feedback) {
    res.status(404);
    throw new Error("Feedback not found");
  }
  res.json({ success: true, feedback });
});

export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);
  if (!feedback) {
    res.status(404);
    throw new Error("Feedback not found");
  }
  res.json({ success: true, message: "Feedback deleted" });
});
