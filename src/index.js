// src/index.js
import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env at the very beginning

import express from "express";
import mongoose from "mongoose";

import notificationRoutes from "./routes/notification.routes.js";
import authRoutes from "./routes/auth.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import paymentRoutes from "./routes/payment.routes.js"; // ✅ Import payment routes

const app = express();
const PORT = process.env.PORT || 3500;

// Parse JSON
app.use(express.json());

// Debug: log all requests
app.use((req, res, next) => {
  console.log("📨 Incoming Request:", {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });
  next();
});

// Mount routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes); // ✅ Payment routes

console.log("✅ Notification routes mounted at /api/notifications");
console.log("✅ Auth routes mounted at /api/auth");
console.log("✅ Invoice routes mounted at /api/invoices");
console.log("✅ Payment routes mounted at /api/payments");

// Health check
app.get("/", (req, res) => {
  console.log("🏥 Health check endpoint hit");
  res.send("InvoiceFlow API running...");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🎯 Server running on http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use!`);
      } else {
        console.error("❌ Server error:", error.message);
      }
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection failed:", err.message);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🎯 Server running on http://localhost:${PORT} (without DB)`);
    });
  });

// Handle uncaught exceptions & unhandled rejections
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
