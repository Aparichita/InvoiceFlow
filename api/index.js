// api/index.js
import serverless from "serverless-http";
import express from "express";
import mongoose from "mongoose";

const app = express();

// --------------------------
// Middleware
// --------------------------
app.use(express.json());

// --------------------------
// Example route
// --------------------------
app.get("/", (req, res) => {
  res.send("✅ InvoiceFlow API is running!");
});

// --------------------------
// Connect to MongoDB
// --------------------------
// Use a cached connection to avoid multiple connections per cold start
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Connect once at startup
connectToDatabase()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB Connection failed:", err.message));

// --------------------------
// Export for Vercel
// --------------------------
export default serverless(app);
