import express from "express";
import {
  sendWhatsappMessage,
  sendInvoiceEmail,
} from "../controllers/notification.controller.js";

const router = express.Router();

// WhatsApp route
router.post("/send", sendWhatsappMessage);

// Invoice email route
router.post("/send-invoice-email", sendInvoiceEmail);

export default router;
