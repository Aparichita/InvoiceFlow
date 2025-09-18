import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import serverless from "serverless-http";
import app from "../src/index.js";

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err.message));

export default serverless(app);
