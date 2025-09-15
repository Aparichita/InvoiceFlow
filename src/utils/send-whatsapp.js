// src/utils/send-whatsapp.js
import twilio from "twilio";
import { ApiError } from "./api-error.js";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

export const sendWhatsApp = async (toPhone, message, mediaUrls = []) => {
  try {
    if (!toPhone) throw new ApiError(400, "Recipient phone number required");

    // Twilio expects whatsapp:+91XXXXXXXXXX format
    const to = toPhone.startsWith("whatsapp:")
      ? toPhone
      : `whatsapp:${toPhone}`;
    const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"; // sandbox

    const payload = {
      from,
      to,
      body: message,
    };

    if (mediaUrls && mediaUrls.length > 0) {
      payload.mediaUrl = mediaUrls;
    }

    const response = await client.messages.create(payload);
    return response;
  } catch (err) {
    console.error("sendWhatsApp error:", err);
    throw new ApiError(500, "Failed to send WhatsApp message");
  }
};

export default sendWhatsApp;
