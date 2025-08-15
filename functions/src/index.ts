import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();

// --- NOVA ESTRUTURA: INICIALIZAÇÃO PREGUIÇOSA (LAZY INITIALIZATION) ---

// A variável 'stripe' é declarada aqui, mas só será inicializada quando for necessária.
let stripe: Stripe;

/**
 * Esta função auxiliar garante que o cliente Stripe é inicializado apenas uma vez
 * e só quando uma função precisa dele. Isto evita que o servidor crashe no arranque.
 */
function getStripeClient() {
  if (!stripe) {
    // Lê a chave do ficheiro .env através de process.env
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error("A variável de ambiente STRIPE_SECRET_KEY não foi definida.");
    }
    stripe = new Stripe(stripeKey, {
      apiVersion: "2025-07-30.basil",
    });
  }
  return stripe;
}

// --- FIM DA NOVA ESTRUTURA ---


interface CheckoutData {
  priceId: string;
}

export const createStripeCheckout = functions.https.onCall(
  async (request) => {
    // Inicializa o cliente Stripe SÓ AGORA que a função foi chamada
    const stripeClient = getStripeClient();
    const data = request.data as CheckoutData;

    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Apenas utilizadores autenticados podem comprar."
      );
    }

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      // Lê a URL do ficheiro .env
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
  // Inicializa o cliente Stripe SÓ AGORA que a função foi chamada
  const stripeClient = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("O segredo do webhook (STRIPE_WEBHOOK_SECRET) não está definido.");
    res.status(400).send("Webhook secret is not configured.");
    return;
  }
  
  const signature = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripeClient.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
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