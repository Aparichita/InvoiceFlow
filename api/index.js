import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import serverless from "serverless-http";
import path from "path";

import  errorHandler  from "./middlewares/error.middleware.js";

dotenv.config();
const app = express();
app.use(express.json());

// Dynamic route loader
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
    console.warn(`⚠️ Route file not found: ${routePath}`);
    app.use(routeName, (req, res) =>
      res.status(404).json({ error: `${routeName} route missing` })
    );
  }
};

// Load your routes
safeImportRoute("./auth/auth.routes.js", "/api/auth");
safeImportRoute("./invoices/invoice.routes.js", "/api/invoices");
safeImportRoute("./notifications/notification.routes.js", "/api/notifications");
safeImportRoute("./payments/payment.routes.js", "/api/payments");
safeImportRoute("./whatsapp/whatsapp.routes.js", "/api/whatsapp");

// Error handler
app.use(errorHandler);

// MongoDB connection (runs on first cold start)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

// Local dev server only
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 3500;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// Vercel handler
export const handler = serverless(app);
