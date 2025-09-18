// src/routes/payment.routes.js
import express from "express";
import {
  createCheckoutSession,
  stripeWebhook,
} from "../controllers/payment.controller.js";
import bodyParser from "body-parser";

const router = express.Router();

// Stripe requires raw body for webhook
router.post(
  "/webhook/stripe",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

// Create Stripe Checkout Session
router.post("/create-checkout-session", createCheckoutSession);

export default router;
