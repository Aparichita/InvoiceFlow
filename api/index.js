import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./api/auth/auth.routes.js";
import invoiceRoutes from "./api/invoices/invoice.routes.js";
import notificationRoutes from "./api/notifications/notification.routes.js";
import paymentRoutes from "./api/payments/payment.routes.js";
import whatsappRoutes from "./api/routes/whatsapp.routes.js";
import { errorHandler } from "./api/middlewares/error.middleware.js";

dotenv.config();

const app = express();

// Use port 3500 locally, Vercel will override process.env.PORT automatically
const PORT = process.env.PORT || 3500;

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/whatsapp", whatsappRoutes);

// Error handler
app.use(errorHandler);

// Connect to MongoDB & start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB connection error:", err));
