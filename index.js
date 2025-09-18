// index.js
import express from "express";
import authRoutes from "./api/routes/auth.routes.js";
import invoiceRoutes from "./api/routes/invoice.routes.js";
import notificationRoutes from "./api/routes/notification.routes.js";
import paymentRoutes from "./api/routes/payment.routes.js";

const app = express();
app.use(express.json());

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);

export default app; // Vercel handles this automatically
