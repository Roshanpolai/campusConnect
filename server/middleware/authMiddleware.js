import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/User.js";

// Verifies the JWT from the Authorization header and attaches req.user
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  // Check for Bearer token in Authorization header
  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  }

  // If no token is found, return 401 Unauthorized
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  // Verify the token and attach the user to req.user
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    // If the user is not found or is blocked, return an error
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }
    if (req.user.status === "blocked") {
      res.status(403);
      throw new Error("Your account has been blocked. Contact an admin.");
    }
    next();
  } 
  catch (error) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});
