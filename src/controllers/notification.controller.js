// src/controllers/notification.controller.js
import asyncHandler from "../utils/async-handler.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Send WhatsApp message using WhatsApp Cloud API
 */
export const sendWhatsappMessage = asyncHandler(async (req, res) => {
  console.log("📲 sendWhatsappMessage controller called");
  console.log("📋 Request body:", req.body);

  const { to, message } = req.body;

  if (!to || !message) {
    console.log("❌ Validation failed: Missing 'to' or 'message'");
    return res.status(400).json({
      success: false,
      message: "Recipient number and message required",
    });
  }

  console.log("✅ Validation passed");
  console.log("📞 Recipient:", to);
  console.log("💭 Message:", message);

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: message },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        },
      }
    );

    console.log("✅ WhatsApp API response:", response.data);

    res.status(200).json({
      success: true,
      message: "WhatsApp message sent successfully",
      data: response.data,
    });
  } catch (err) {
    console.error("❌ WhatsApp API Error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Failed to send WhatsApp message",
      error: err.response?.data || err.message,
    });
  }
});

/**
 * Send Invoice Email (stub for now)
 */
export const sendInvoiceEmail = asyncHandler(async (req, res) => {
  console.log("📧 sendInvoiceEmail controller called");
  console.log("📋 Request body:", req.body);

  const { to, subject, html, invoiceId } = req.body;

  if (!to || !subject || !html) {
    console.log("❌ Validation failed: Missing required email fields");
    return res.status(400).json({
      success: false,
      message: "Recipient email, subject, and HTML content are required",
    });
  }

  console.log("✅ Email validation passed");
  console.log("📩 To:", to);
  console.log("📋 Subject:", subject);
  console.log("📄 Invoice ID:", invoiceId);

  console.log("🤖 Simulating email sending...");

  res.status(200).json({
    success: true,
    message: "Invoice email sent (stub)",
    data: { to, subject, invoiceId },
  });

  console.log("✅ Email response sent");
});
