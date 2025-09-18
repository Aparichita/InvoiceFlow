// api/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";

import notificationRoutes from "../src/routes/notification.routes.js";
import authRoutes from "../src/routes/auth.routes.js";
import invoiceRoutes from "../src/routes/invoice.routes.js";
import paymentRoutes from "../src/routes/payment.routes.js";

const app = express();

// Parse JSON
app.use(express.json());

// Debug logger
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
app.use("/api/payments", paymentRoutes);

console.log("✅ Routes mounted");

// Health check
app.get("/", (req, res) => {
  res.send("InvoiceFlow API running...");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB Connection failed:", err.message));

// Export app (no app.listen, because Vercel runs it)
export default app;
