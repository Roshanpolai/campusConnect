import Resource from "../models/Resource.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

// @desc  Submit a new Notes / PYQ / Academic Resource upload for review.
//        The file itself is uploaded first via POST /api/uploads/document,
//        and this endpoint just records the metadata + starts it as "pending".
// @route POST /api/resources
export const createResource = asyncHandler(async (req, res) => {
  const {
    title, description, type, subject, department, year, section, semester,
    fileUrl, cloudinaryPublicId, fileName, fileSize, fileType,
  } = req.body;

  if (!title || !type || !subject || !department || !year || !fileUrl || !cloudinaryPublicId) {
    res.status(400);
    throw new Error("Missing required fields for this upload");
  }

  const resource = await Resource.create({
    title, description, type, subject, department, year, section, semester,
    fileUrl, cloudinaryPublicId, fileName, fileSize, fileType,
    uploadedBy: req.user._id,
  });

  res.status(201).json({ success: true, resource });
});

// @desc  Browse approved resources (what every student sees)
// @route GET /api/resources?department=&year=&section=&subject=&type=&search=
export const getResources = asyncHandler(async (req, res) => {
  const { department, year, section, subject, type, search } = req.query;
  const query = { status: "approved" };
  if (department) query.department = department;
  if (year) query.year = year;
  if (section) query.section = section;
  if (subject) query.subject = { $regex: subject, $options: "i" };
  if (type && type !== "All") query.type = type;
  if (search) query.title = { $regex: search, $options: "i" };

  const resources = await Resource.find(query).populate("uploadedBy", "fullName").sort({ createdAt: -1 });
  res.json({ success: true, count: resources.length, resources });
});

// @desc  The logged-in student's own uploads, any status
// @route GET /api/resources/mine
export const getMyResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, resources });
});

// @desc  Queue of resources awaiting moderation
// @route GET /api/resources/pending
export const getPendingResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ status: "pending" }).populate("uploadedBy", "fullName email").sort({ createdAt: 1 });
  res.json({ success: true, resources });
});

// @desc  Approve a resource — makes it visible to everyone
// @route PUT /api/resources/:id/approve
export const approveResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { status: "approved", reviewedBy: req.user._id, reviewedAt: new Date(), reviewNote: "" },
    { new: true }
  );
  if (!resource) {
    res.status(404);
    throw new Error("Resource not found");
  }
  res.json({ success: true, resource });
});

// @desc  Reject a resource, with an optional reason shown to the uploader
// @route PUT /api/resources/:id/reject
export const rejectResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", reviewedBy: req.user._id, reviewedAt: new Date(), reviewNote: req.body.reviewNote || "" },
    { new: true }
  );
  if (!resource) {
    res.status(404);
    throw new Error("Resource not found");
  }
  res.json({ success: true, resource });
});

// @desc  Delete a resource. Owners can delete their own pending/rejected
//        uploads; moderators/admins can delete anything.
// @route DELETE /api/resources/:id
export const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    res.status(404);
    throw new Error("Resource not found");
  }

  const isModerator = ["moderator", "super_admin"].includes(req.user.role);
  const isOwner = resource.uploadedBy.equals(req.user._id);
  if (!isModerator && !(isOwner && resource.status !== "approved")) {
    res.status(403);
    throw new Error("You can only delete your own pending or rejected uploads");
  }

  await deleteFromCloudinary(resource.cloudinaryPublicId, "raw");
  await resource.deleteOne();
  res.json({ success: true, message: "Resource deleted" });
});

// @desc  Track a download (best-effort click counter)
// @route PUT /api/resources/:id/download
export const trackDownload = asyncHandler(async (req, res) => {
  await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
  res.json({ success: true });
});
