import Schedule from "../models/Schedule.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

export const getSchedule = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "super_admin";
  const department = (isAdmin && req.query.department) || req.user.department;
  const year = (isAdmin && req.query.year) || req.user.year;
  const section = (isAdmin ? req.query.section : req.user.section) || "";

  const schedule = await Schedule.findOne({ department, year, section });
  res.json({ success: true, schedule: schedule || null });
});

export const getScheduleGroups = asyncHandler(async (req, res) => {
  const groups = await Schedule.find(
    {},
    "department year section fileName updatedAt",
  ).sort({ department: 1, year: 1, section: 1 });
  res.json({ success: true, groups });
});

export const upsertSchedule = asyncHandler(async (req, res) => {
  const {
    department,
    year,
    section = "",
    fileUrl,
    cloudinaryPublicId,
    fileName,
    fileSize,
  } = req.body;

  if (!department || !year || !fileUrl || !cloudinaryPublicId) {
    res.status(400);
    throw new Error("Missing required fields to publish a timetable");
  }

  const existing = await Schedule.findOne({ department, year, section });
  if (existing && existing.cloudinaryPublicId !== cloudinaryPublicId) {
    await deleteFromCloudinary(existing.cloudinaryPublicId, "raw"); // avoid orphaned files on replace
  }

  const schedule = await Schedule.findOneAndUpdate(
    { department, year, section },
    {
      department,
      year,
      section,
      fileUrl,
      cloudinaryPublicId,
      fileName,
      fileSize,
      uploadedBy: req.user._id,
    },
    { new: true, upsert: true },
  );
  res.status(201).json({ success: true, schedule });
});

export const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);
  if (!schedule) {
    res.status(404);
    throw new Error("Timetable not found");
  }
  await deleteFromCloudinary(schedule.cloudinaryPublicId, "raw");
  res.json({ success: true, message: "Timetable removed" });
});
