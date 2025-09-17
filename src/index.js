// src/index.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config(); // load .env variables

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not set in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection failed", err);
    process.exit(1);
  });
