import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();

let stripe: Stripe;

function getStripeClient() {
  if (!stripe) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new functions.https.HttpsError(
        "internal",
        "A chave secreta do Stripe não está configurada."
      );
    }
    stripe = new Stripe(stripeKey, {
      apiVersion: "2025-07-30.basil",
    });
  }
  return stripe;
}

// --- Função para criar checkout ---
export const createStripeCheckout = functions.https.onCall(
  async (data, context) => {
    // Type narrowing: garante que context.auth existe e informa o TypeScript
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Apenas utilizadores autenticados podem comprar."
      );
    }

    try {
      const stripeClient = getStripeClient();
      const userId = context.auth.uid; // seguro porque fizemos a verificação
      const priceId = "price_1Rw269LK5hWMG2KsKdOctG25"; // O seu Price ID

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.BASE_URL}/profile?upgrade=success`,
        cancel_url: `${process.env.BASE_URL}/upgrade`,
        metadata: {
          userId: userId,
        },
      });

      return { id: session.id };
    } catch (error) {
      console.error("Erro ao criar checkout:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Não foi possível criar a sessão de checkout."
      );
    }
  }
);

// --- Função para Webhook ---
export const stripeWebhook = functions.https.onRequest(
  async (req, res) => {
    try {
      const stripeClient = getStripeClient();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error(
          "O segredo do webhook (STRIPE_WEBHOOK_SECRET) não está definido."
        );
        res.status(400).send("Webhook secret is not configured.");
        return;
      }

      const signature = req.headers["stripe-signature"] as string;
      const event = stripeClient.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
          // Correção da sintaxe para aceder à base de dados
          const userProfileRef = db.collection("users").doc(userId);
          await userProfileRef.update({ plan: "pro" });
          console.log(`Utilizador ${userId} atualizado para o plano Pro.`);
        }
      }

      res.status(200).send();
    } catch (err: any) {
      console.error("⚠️ Erro no webhook.", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);