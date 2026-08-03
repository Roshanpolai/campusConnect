import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

// desc -> Update own profile
// route -> PUT /api/users/me
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "fullName",
    "department",
    "year",
    "avatar",
    "about",
    "skills",
    "achievements",
    "resumeUrl",
    "socialLinks",
    "notificationPrefs",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  const updated = await req.user.save();
  res.json({ success: true, user: updated.toSafeObject() });
});

// desc ->  Change password
// route -> PUT /api/users/me/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password updated successfully" });
});

// desc -> Delete own account
// route -> DELETE /api/users/me
export const deleteOwnAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: "Account deleted" });
});

// ---------- Admin ----------
// desc -> List / search users
// route -> GET /api/users
export const getUsers = asyncHandler(async (req, res) => {
  const { search = "", role } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role && role !== "all") query.role = role;

  const users = await User.find(query).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// desc -> Update a user's role
// route -> PUT /api/users/:id/role
export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.role = req.body.role;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// desc -> Block / unblock a user
// route -> PUT /api/users/:id/status
export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.status = req.body.status;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// desc -> Delete a user (admin)
// route -> DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, message: "User deleted" });
});
