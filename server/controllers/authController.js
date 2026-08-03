import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { sendEmail, buildResetPasswordEmail } from "../utils/sendEmail.js";

// Register new student
// POST /api/auth/register
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, studentId, department, year, section, password, confirmPassword } = req.body;

  if (!fullName || !email || !studentId || !department || !year || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  const existing = await User.findOne({ $or: [{ email }, { studentId }] });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email or student ID already exists");
  }

  const user = await User.create({ fullName, email, studentId, department, year, section, password });

  res.status(201).json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});


// Login user and get token
// POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  if (user.status === "blocked") {
    res.status(403);
    throw new Error("Your account has been blocked. Contact an admin.");
  }

  res.json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});


// Request a password reset token
// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond the same way so we don't leak which emails exist
  if (!user) {
    return res.json({ success: true, message: "If that account exists, a reset link has been sent." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
  const { subject, html, text } = buildResetPasswordEmail(resetUrl);
  const emailResult = await sendEmail({ to: user.email, subject, html, text });

  if (!emailResult.sent) {
    console.warn(`[forgot-password] Email not sent (${emailResult.reason}). Reset URL: ${resetUrl}`);
  }

  res.json({
    success: true,
    message: emailResult.sent
      ? "If that account exists, a reset link has been sent to their email."
      : "If that account exists, a reset link has been generated. (Email delivery is not configured — check the server console for the link, or set up SMTP in .env.)",
    devResetToken: process.env.NODE_ENV === "production" ? undefined : resetToken,
  });
});

// Reset password using token
// POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    res.status(400);
    throw new Error("Reset link is invalid or has expired");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password has been reset. You can now log in." });
});

// Get logged-in user's profile
// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});
