// Import any helper functions from your src folder
import { sendWhatsApp } from "../../../src/utils/whatsapp.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { customerName, phone } = req.body || {};
    if (!customerName || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // Call your WhatsApp function here
    await sendWhatsApp(customerName, phone);

    return res
      .status(200)
      .json({ success: true, message: "Notification sent!" });
  } catch (error) {
    console.error("Error in /notifications/send:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
