// routes/payment.routes.js
import express from "express";
import {
  createOrder,
  verifyPayment,
  razorpayWebhook,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/webhook/razorpay", razorpayWebhook);

export default router;
