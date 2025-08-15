import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();

// A sua chave secreta do Stripe deve estar nas variáveis de ambiente do Firebase
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export const createStripeCheckout = functions.https.onCall(async (data, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Apenas utilizadores autenticados podem comprar.",
    );
  }

  // IMPORTANTE: Substitua este ID pelo Price ID que criou no seu Stripe Dashboard
  const priceId = "price_1Rw269LK5hWMG2KsKdOctG25"; 

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // Lembre-se de adicionar o seu URL da Vercel ao .env das functions
    success_url: `${process.env.BASE_URL}/profile?upgrade=success`,
    cancel_url: `${process.env.BASE_URL}/upgrade`,
    metadata: {
        userId: context.auth.uid,
    },
  });

  return {
    id: session.id,
  };
});


// Webhook para ouvir os eventos do Stripe
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
    const signature = req.headers["stripe-signature"] as string;
    
    // A sua chave secreta do webhook deve estar nas variáveis de ambiente
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, signature, endpointSecret);
    } catch (err: any) {
        console.error("⚠️  Erro na verificação do webhook.", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Lidar com o evento 'checkout.session.completed'
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
            // Atualiza o perfil do utilizador na base de dados para 'pro'
            const userProfileRef = db.collection('users').doc(userId);
            await userProfileRef.update({ plan: 'pro' });
            console.log(`Utilizador ${userId} atualizado para o plano Pro.`);
        }
    }

    res.status(200).send();
});