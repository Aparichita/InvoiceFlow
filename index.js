import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import serverless from "serverless-http"; // for Vercel
import fs from "fs";
import { pathToFileURL } from "url";

import  errorHandler  from "./api/middlewares/error.middleware.js";

dotenv.config();

const app = express();
app.use(express.json());

// ------------------------
// Helper function for safe route loading
// ------------------------
async function loadRoute(routePath, routeName) {
  if (fs.existsSync(routePath)) {
    try {
      const routeModule = await import(pathToFileURL(routePath).href);
      app.use(routeName, routeModule.default);
      console.log(`✅ Loaded route: ${routeName}`);
    } catch (err) {
      console.error(`❌ Error loading route ${routeName}:`, err.message);
      app.use(routeName, (req, res) =>
        res.status(500).json({ error: `${routeName} route failed to load` })
      );
    }
  } else {
    console.warn(`⚠️ Route file not found: ${routePath}`);
    app.use(routeName, (req, res) =>
      res.status(404).json({ error: `${routeName} route missing` })
    );
  }
}

// ------------------------
// Load your routes safely
// ------------------------
await loadRoute("./api/auth/auth.routes.js", "/api/auth");
await loadRoute("./api/invoices/invoice.routes.js", "/api/invoices");
await loadRoute(
  "./api/notifications/notification.routes.js",
  "/api/notifications"
);
await loadRoute("./api/payments/payment.routes.js", "/api/payments");
await loadRoute("./api/routes/whatsapp.routes.js", "/api/whatsapp");

// Error handler
app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

// Local server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Export handler for Vercel
export const handler = serverless(app);
