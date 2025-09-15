// src/app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import invoiceRoutes from "./routes/invoice.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(express.json());

// static serving for PDFs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/public", express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/invoices", invoiceRoutes);

// Error handler
app.use(errorMiddleware);

export default app;
