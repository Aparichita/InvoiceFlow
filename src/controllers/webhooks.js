// src/controllers/webhooks.js
import Stripe from "stripe";
import User from "../models/user.model.js"; // adjust if file name differs
import Transaction from "../models/invoice.model.js"; // adjust if file name differs

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("⚠️ Stripe webhook signature error:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        // Find checkout session to get metadata
        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });

        const session = sessionList.data[0];
        if (!session) {
          console.warn(
            "⚠️ No checkout session found for payment:",
            paymentIntent.id
          );
          break;
        }

        const { transactionId, appId } = session.metadata;

        if (appId === "quickgpt") {
          const transaction = await Transaction.findOne({
            _id: transactionId,
            isPaid: false,
          });

          if (!transaction) {
            console.warn(
              "⚠️ Transaction not found or already paid:",
              transactionId
            );
            break;
          }

          // update user credits
          await User.updateOne(
            { _id: transaction.userId },
            { $inc: { credits: transaction.credits } }
          );

          // mark transaction as paid
          transaction.isPaid = true;
          await transaction.save();

          console.log(`✅ Credits updated for user ${transaction.userId}`);
        } else {
          return res.json({
            received: true,
            message: "Ignored event: Invalid app",
          });
        }

        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("⚠️ Webhook processing error:", error);
    res.status(500).send("Internal server error");
  }
};
