import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import User from "../models/User.js";

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running the seed script.");
    console.error('Example: ADMIN_EMAIL=ece.23becf33@silicon.ac.in ADMIN_PASSWORD=YourPass123 npm run seed');
    process.exit(1);
  }

  let user = await User.findOne({ email });

  if (user) {
    user.role = "super_admin";
    user.status = "active";
    await user.save();
    console.log(`Existing user ${email} promoted to super_admin.`);
  } else {
    user = await User.create({
      fullName: process.env.ADMIN_NAME || "Super Admin",
      email,
      studentId: process.env.ADMIN_STUDENT_ID || "admin0001",
      department: process.env.ADMIN_DEPARTMENT || "Administration",
      year: "N/A",
      password,
      role: "super_admin",
    });
    console.log(`Created new super_admin account for ${email}.`);
  }

  console.log("Done. Log in with this email/password, then visit /admin.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed script failed:", err.message);
  process.exit(1);
});
