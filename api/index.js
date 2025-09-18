// api/index.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import serverless from "serverless-http";
import app from "../src/index.js";

// Connect to MongoDB (make sure this only runs once per cold start)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB Connection failed:", err.message));

// Wrap express app for Vercel
export default serverless(app);
