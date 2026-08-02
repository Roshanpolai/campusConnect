import Job from "../models/Job.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @desc  List jobs (search, type/location filter, sort)
// @route GET /api/jobs
export const getJobs = asyncHandler(async (req, res) => {
  const { search, jobType, location, sort = "latest" } = req.query;
  const query = { status: "active" };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
    ];
  }
  if (jobType && jobType !== "All") query.jobType = jobType;
  if (location && location !== "All") query.location = { $regex: location, $options: "i" };

  const sortMap = { latest: { createdAt: -1 }, deadline: { deadline: 1 } };
  const jobs = await Job.find(query).sort({ pinned: -1, ...(sortMap[sort] || sortMap.latest) });
  res.json({ success: true, count: jobs.length, jobs });
});

export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  res.json({ success: true, job });
});

// @desc  Create job (job_poster / super_admin only)
// @route POST /api/jobs
export const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json({ success: true, job });
});

export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  res.json({ success: true, job });
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  res.json({ success: true, message: "Job deleted" });
});

// @desc  Toggle save for a job
// @route PUT /api/jobs/:id/save
export const toggleSaveJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  const saved = job.savedBy.some((id) => id.equals(req.user._id));
  job.savedBy = saved
    ? job.savedBy.filter((id) => !id.equals(req.user._id))
    : [...job.savedBy, req.user._id];
  await job.save();
  res.json({ success: true, saved: !saved });
});

// @desc  Report a job as expired/incorrect
// @route PUT /api/jobs/:id/report
export const reportJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { $inc: { reportedCount: 1 } }, { new: true });
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  res.json({ success: true, message: "Thanks, we'll review this listing" });
});

// @desc  Mark expired / pin (admin)
// @route PUT /api/jobs/:id/status
export const updateJobStatus = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  res.json({ success: true, job });
});
