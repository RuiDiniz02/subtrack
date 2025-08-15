import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil", // verifica se é válido
});

interface CheckoutData {
  priceId: string;
}

export const createStripeCheckout = functions.https.onCall(
  async (request) => {
    const data = request.data as CheckoutData;

    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Apenas utilizadores autenticados podem comprar."
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL}/profile?upgrade=success`,
      cancel_url: `${process.env.BASE_URL}/upgrade`,
      metadata: {
        userId: request.auth.uid,
      },
    });

    return { id: session.id };
  }
);

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, endpointSecret);
  } catch (err: any) {
    console.error("⚠️ Erro na verificação do webhook.", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (userId) {
      const userProfileRef = db.collection("users").doc(userId);
      await userProfileRef.update({ plan: "pro" });
      console.log(`Utilizador ${userId} atualizado para o plano Pro.`);
    }
  }

  res.status(200).send();
});
