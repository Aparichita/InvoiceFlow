// src/controllers/payment.controller.js
import dotenv from "dotenv";
dotenv.config(); // ✅ Load env first

import Stripe from "stripe";
import Invoice from "../../src/models/invoice.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27",
});

/**
 * Create Stripe Checkout Session
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Invoice #${invoice._id}` },
            unit_amount: invoice.amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { invoiceId: invoice._id.toString() },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Error creating checkout session:", err.message);
    res
      .status(500)
      .json({ message: "Failed to create Stripe session", error: err.message });
  }
};

/**
 * Stripe Webhook
 */
export const stripeWebhook = async (req, res) => {
  let event;

  // Skip signature verification for local testing
  if (process.env.NODE_ENV === "development") {
    event = req.body;
    console.log("⚠️ Local webhook testing - signature verification skipped");
  } else {
    const sig = req.headers["stripe-signature"];
    if (!sig)
      return res.status(400).send("Webhook Error: Missing stripe-signature");

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const invoiceId = session.metadata.invoiceId;
      await Invoice.findByIdAndUpdate(invoiceId, { paid: true });
      console.log(`✅ Invoice ${invoiceId} marked as paid`);
      break;

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`✅ PaymentIntent succeeded: ${paymentIntent.id}`);
      break;

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
