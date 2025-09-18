// src/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse JSON
app.use(express.json());

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, "../public"))); // <- correct path

// Fallback for non-API routes (SPA routing)
app.get("*", (req, res) => {
  // send index.html for any route not starting with /api
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  }
});

export default app;
