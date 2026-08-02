import LostFoundItem from "../models/LostFoundItem.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getLostFoundItems = asyncHandler(async (req, res) => {
  const { type, search } = req.query;
  const query = { flagged: false };
  if (type && ["lost", "found"].includes(type)) query.type = type;
  if (search) query.itemName = { $regex: search, $options: "i" };

  const items = await LostFoundItem.find(query).sort({ createdAt: -1 });
  res.json({ success: true, count: items.length, items });
});

export const createLostFoundItem = asyncHandler(async (req, res) => {
  const item = await LostFoundItem.create({ ...req.body, reportedBy: req.user._id });
  res.status(201).json({ success: true, item });
});

export const deleteLostFoundItem = asyncHandler(async (req, res) => {
  const item = await LostFoundItem.findByIdAndDelete(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Report not found");
  }
  res.json({ success: true, message: "Report removed" });
});

// @desc Moderation: mark returned / remove fake report
// @route PUT /api/lostfound/:id/moderate
export const moderateLostFoundItem = asyncHandler(async (req, res) => {
  const item = await LostFoundItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) {
    res.status(404);
    throw new Error("Report not found");
  }
  res.json({ success: true, item });
});
