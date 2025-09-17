import asyncHandler from "../utils/async-handler.js";

export const sendWhatsappMessage = asyncHandler(async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message)
    return res
      .status(400)
      .json({
        success: false,
        message: "Recipient number and message required",
      });

  // Replace with real WhatsApp API call
  console.log("Sending WhatsApp message to", to, ":", message);

  res
    .status(200)
    .json({ success: true, message: "WhatsApp message sent (stub)" });
});
