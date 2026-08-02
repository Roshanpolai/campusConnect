import Event from "../models/Event.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @desc  List events (with category filter + search)
// @route GET /api/events
export const getEvents = asyncHandler(async (req, res) => {
  const { category, search, mine, userId } = req.query;
  const query = {};
  if (category && category !== "All") query.category = category;
  if (search) query.name = { $regex: search, $options: "i" };
  if (mine === "true" && userId) query.registeredStudents = userId;

  const events = await Event.find(query).sort({ date: 1 });
  res.json({ success: true, count: events.length, events });
});

// @desc  Get single event
// @route GET /api/events/:id
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  res.json({ success: true, event });
});

// @desc  Create event (admin/coordinator)
// @route POST /api/events
export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, event });
});

// @desc  Update event
// @route PUT /api/events/:id
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  res.json({ success: true, event });
});

// @desc  Delete event
// @route DELETE /api/events/:id
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  res.json({ success: true, message: "Event deleted" });
});

// @desc  Register / unregister for an event
// @route PUT /api/events/:id/register
export const toggleRegistration = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  const alreadyRegistered = event.registeredStudents.some((id) => id.equals(req.user._id));
  if (alreadyRegistered) {
    event.registeredStudents = event.registeredStudents.filter((id) => !id.equals(req.user._id));
  } else {
    event.registeredStudents.push(req.user._id);
  }
  await event.save();
  res.json({ success: true, event, registered: !alreadyRegistered });
});

// @desc  View registrations for an event (admin)
// @route GET /api/events/:id/registrations
export const getEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate("registeredStudents", "fullName email department");
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  res.json({ success: true, registrations: event.registeredStudents });
});
