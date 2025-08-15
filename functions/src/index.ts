import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const createStripeCheckout = functions.https.onCall(async (data, context) => { // O tipo explícito foi removido para usar a inferência do TypeScript
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Apenas utilizadores autenticados podem comprar.",
    );
  }

  // SUBSTITUA ESTE ID pelo ID do preço que criou no seu painel do Stripe
  const priceId = "price_SEU_ID_DE_PRECO_AQUI";

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


// NOVA CLOUD FUNCTION: Webhook para ouvir os eventos do Stripe
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
    const signature = req.headers["stripe-signature"] as string;
    
    // É crucial ter uma chave secreta para o webhook para garantir que os pedidos vêm do Stripe
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
