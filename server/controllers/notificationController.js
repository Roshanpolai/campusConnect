import Notification from "../models/Notification.js";
import asyncHandler from "../middleware/asyncHandler.js";

const audienceForRole = (role) => {
  const map = {
    student: "Students",
    job_poster: "Job Posters",
    event_coordinator: "Event Coordinators",
  };
  return map[role];
};

// @desc  Get notifications relevant to the logged-in user
// @route GET /api/notifications
export const getMyNotifications = asyncHandler(async (req, res) => {
  const relevantAudience = audienceForRole(req.user.role);
  const notifications = await Notification.find({
    $or: [{ audience: "Everyone" }, ...(relevantAudience ? [{ audience: relevantAudience }] : [])],
  }).sort({ createdAt: -1 });

  const withReadState = notifications.map((n) => ({
    ...n.toObject(),
    read: n.readBy.some((id) => id.equals(req.user._id)),
  }));

  res.json({ success: true, notifications: withReadState });
});

// @desc  Mark a notification as read
// @route PUT /api/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
  res.json({ success: true });
});

// @desc  Compose + send a notification (admin)
// @route POST /api/notifications
export const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, notification });
});
