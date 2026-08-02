import "dotenv/config";
// dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import lostFoundRoutes from "./routes/lostFoundRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";

await connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ success: true, message: "CampusConnect API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/lostfound", lostFoundRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/resources", resourceRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`CampusConnect API listening on port ${PORT}`));
