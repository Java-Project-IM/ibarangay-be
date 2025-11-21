import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler";

// Import routes
import authRoutes from "./routes/authRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import complaintRoutes from "./routes/complaintRoutes";
import eventRoutes from "./routes/eventRoutes";
import notificationRoutes from "./routes/notificationRoutes";

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/services`, serviceRoutes);
app.use(`/api/${apiVersion}/complaints`, complaintRoutes);
app.use(`/api/${apiVersion}/events`, eventRoutes);
app.use(`/api/${apiVersion}/notifications`, notificationRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
