import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();
const PORT = process.env.PORT || 3500;

// Middleware to parse JSON
app.use(express.json());

// Debug middleware - log all incoming requests
app.use((req, res, next) => {
  console.log("📨 Incoming Request:", {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });
  next();
});

// Register notification routes
app.use("/api/notifications", notificationRoutes);
console.log("✅ Notification routes mounted at /api/notifications");

// Health check
app.get("/", (req, res) => {
  console.log("🏥 Health check endpoint hit");
  res.send("InvoiceFlow API running...");
});

// Connect to MongoDB with better error handling
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Start server with error handling
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🎯 Server running on http://localhost:${PORT}`);
      console.log("🌐 Available endpoints:");
      console.log("   GET  /");
      console.log("   POST /api/notifications/send");
      console.log("   POST /api/notifications/send-invoice-email");
    });

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.log("💡 Try: netstat -ano | findstr :3500");
        console.log("💡 Then: taskkill /pid <PID> /f");
      } else {
        console.error("❌ Server error:", error.message);
      }
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection failed:", err.message);
    console.log("⚠️  Starting server without database connection...");

    // Start server even if DB fails
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🎯 Server running on http://localhost:${PORT} (without DB)`);
    });
  });

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
