import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import serverless from "serverless-http";
import path from "path";

import { errorHandler } from "./api/middlewares/error.middleware.js";

dotenv.config();
const app = express();
app.use(express.json());

const safeImportRoute = (routePath, routeName) => {
  const fullPath = path.resolve(routePath);
  if (fs.existsSync(fullPath)) {
    import(routePath)
      .then((mod) => {
        app.use(routeName, mod.default);
        console.log(`✅ Loaded route: ${routeName}`);
      })
      .catch((err) => {
        console.error(`❌ Error loading route ${routeName}:`, err.message);
      });
  } else {
    // Fallback route if file is missing
    console.warn(`⚠️ Route file not found: ${routePath}`);
    app.use(routeName, (req, res) =>
      res.status(404).json({ error: `${routeName} route missing` })
    );
  }
};

// Update these paths to match your actual file structure
safeImportRoute("./api/auth/auth.routes.js", "/api/auth");
safeImportRoute("./api/invoices/invoice.routes.js", "/api/invoices");
safeImportRoute(
  "./api/notifications/notification.routes.js",
  "/api/notifications"
);
safeImportRoute("./api/payments/payment.routes.js", "/api/payments");
safeImportRoute("./api/whatsapp/whatsapp.routes.js", "/api/whatsapp");

// Error handler
app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

// Local server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Export handler for Vercel
export const handler = serverless(app);
