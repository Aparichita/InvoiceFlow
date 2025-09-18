// api/index.js
import express from "express";
import serverless from "serverless-http";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./auth/auth.routes.js";

dotenv.config();
const app = express();
app.use(express.json());

// Debug log for serverless entry
console.log("🚀 index.js loaded - serverless function initialized");

// Routes with debug log
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

// Local dev only
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 3500;
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
}

// Export for Vercel
export default serverless(app);
