// src/controllers/payment.controller.js
import asyncHandler from "../utils/async-handler.js";
import crypto from "crypto";

// Razorpay stub — will warn if keys not set
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET_RAZORPAY = process.env.WEBHOOK_SECRET_RAZORPAY;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn(
    "⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set. Payment functions will use stubs."
  );
}

// === Create Razorpay order ===
export const createOrder = asyncHandler(async (req, res) => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return res.status(200).json({
      success: true,
      message:
        "Razorpay keys not set. This is a stub order response for testing.",
      order: { id: "stub_order_123", amount: req.body.amount || 0 },
    });
  }

  // Real Razorpay logic can go here when keys are available
  return res.status(500).json({
    success: false,
    message: "Razorpay integration not ready yet.",
  });
});

// === Verify payment ===
export const verifyPayment = asyncHandler(async (req, res) => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return res.status(200).json({
      success: true,
      message:
        "Razorpay keys not set. This is a stub verification response for testing.",
      verified: true,
    });
  }

  // Real verification logic goes here
  return res.status(500).json({
    success: false,
    message: "Razorpay verification not ready yet.",
  });
});

// === Razorpay webhook handler ===
export const razorpayWebhook = asyncHandler(async (req, res) => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.log("Stub webhook received:", req.body);
    return res.status(200).send("OK (stub webhook)");
  }

  // Real webhook handling logic goes here
  return res.status(500).send("Razorpay webhook not ready yet");
});
