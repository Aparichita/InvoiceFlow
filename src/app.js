// src/app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import invoiceRoutes from "./routes/invoice.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// ==== Razorpay webhook raw parser (must come BEFORE express.json()) ====
app.use("/api/payments/webhook/razorpay", express.raw({ type: "*/*" }));

// ==== JSON parser for all other routes ====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==== Static serving for PDFs ====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/public", express.static(path.join(__dirname, "../public")));

// ==== API routes ====
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/whatsapp", whatsappRoutes);

// ==== Global error handler ====
app.use(errorMiddleware);

export default app;
