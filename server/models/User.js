import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "silicon.ac.in";

const SILICON_EMAIL_REGEX = new RegExp(
  `^[a-z]{2,10}\\.[a-z0-9]{4,20}@${ALLOWED_DOMAIN.replace(".", "\\.")}$`,
  "i"
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => SILICON_EMAIL_REGEX.test(value),
        message: `Email must be in the format branchcode.sicid@${ALLOWED_DOMAIN} (e.g. ece.23becf33@${ALLOWED_DOMAIN})`,
      },
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    section: {
       type: String,
       required: true,
       trim: true,
       uppercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: [
        "student",
        "job_poster",
        "event_coordinator",
        "moderator",
        "super_admin",
      ],
      default: "student",
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    avatar: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "",
    },
    skills: [{ type: String }],
    achievements: [{ type: String }],
    resumeUrl: {
      type: String,
      default: "",
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    notificationPrefs: {
      eventUpdates: { type: Boolean, default: true },
      jobUpdates: { type: Boolean, default: true },
      marketplaceMessages: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to hash passwords
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify passwords
userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Method to remove sensitive fields before sending data to the frontend
userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

export default mongoose.model("User", userSchema);
