import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();
const PORT = process.env.PORT || 3500;

// Middleware to parse JSON
app.use(express.json());

// Register notification routes
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/", (req, res) => res.send("InvoiceFlow API running..."));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ DB Connection failed", err));
