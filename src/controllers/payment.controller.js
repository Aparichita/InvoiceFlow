// src/controllers/payment.controller.js
import asyncHandler from "../utils/async-handler.js";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  console.warn(
    "⚠️ STRIPE_SECRET_KEY not set. Stripe functions will use stubs."
  );
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

/**
 * === Create Stripe Checkout Session ===
 */
export const createCheckoutSession = asyncHandler(async (req, res) => {
  if (!stripe) {
    return res.status(200).json({
      success: true,
      message: "Stripe key not set. Stub checkout session for testing.",
      url: "https://example.com/stub-checkout",
    });
  }

  const { amount, currency, transactionId, appId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency || "usd",
            product_data: { name: "Credits Purchase" },
            unit_amount: amount, // amount in cents (Stripe uses smallest unit)
          },
          quantity: 1,
        },
      ],
      metadata: {
        transactionId: transactionId || "unknown",
        appId: appId || "unknown",
      },
      success_url: `${process.env.CLIENT_URL}/payments/success`,
      cancel_url: `${process.env.CLIENT_URL}/payments/cancel`,
    });

    return res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Session error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * === Stripe Webhook Handler ===
 */
export const stripeWebhook = asyncHandler(async (req, res) => {
  if (!stripe) {
    console.log("Stub webhook received:", req.body);
    return res.status(200).send("OK (stub webhook)");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        // Fetch checkout session with metadata
        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });

        const session = sessionList.data[0];
        const { transactionId, appId } = session.metadata;

        console.log("✅ Payment succeeded:", transactionId, appId);

        // TODO: Update Transaction + User credits in DB here

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Internal server error");
  }
});
