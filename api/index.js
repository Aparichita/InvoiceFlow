import express from "express";
import serverless from "serverless-http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./auth/auth.routes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Debug log
console.log("🚀 Serverless function initialized");

// Routes
app.use(
  "/api/auth",
  (req, res, next) => {
    console.log("➡️ Incoming request:", req.method, req.originalUrl);
    console.log("📦 Request body:", req.body);
    next();
  },
  authRoutes
);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB error:", err));

// Local dev
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 3500;
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
}

// Export for Vercel
export default serverless(app);
