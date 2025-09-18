import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "../api/routes/auth.routes.js";
import invoiceRoutes from "../api/routes/invoice.routes.js";
import notificationRoutes from "../api/routes/notification.routes.js";
import paymentRoutes from "../api/routes/payment.routes.js"; // if you have this

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

// Serve static files from public
app.use(express.static(path.join(process.cwd(), "public")));

// Serve invoices
app.use("/invoices", express.static(path.join(process.cwd(), "invoices")));

// SPA fallback for all non-API routes
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api") && !req.path.startsWith("/invoices")) {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
  }
});

export default app;
