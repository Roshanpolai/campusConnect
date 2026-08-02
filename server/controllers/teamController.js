import Team from "../models/Team.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getTeams = asyncHandler(async (req, res) => {
  const { search, skill } = req.query;
  const query = {};
  if (search) query.name = { $regex: search, $options: "i" };
  if (skill && skill !== "All") query.requiredSkills = skill;

  const teams = await Team.find(query).populate("members", "fullName avatar").sort({ createdAt: -1 });
  res.json({ success: true, count: teams.length, teams });
});

export const createTeam = asyncHandler(async (req, res) => {
  const team = await Team.create({ ...req.body, createdBy: req.user._id, members: [req.user._id] });
  res.status(201).json({ success: true, team });
});

export const joinTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }
  if (team.members.length >= team.maxMembers) {
    res.status(400);
    throw new Error("This team is already full");
  }
  if (!team.members.some((id) => id.equals(req.user._id))) {
    team.members.push(req.user._id);
    await team.save();
  }
  res.json({ success: true, team });
});
