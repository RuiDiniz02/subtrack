// src/app/upgrade/page.tsx

'use client';

import Header from "@/components/Header";
import BottomNavbar from "@/components/BottomNavbar";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@/components/Icons";
import { useState } from "react";
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from "@/contexts/AuthContext";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Interface para a resposta da Cloud Function
interface CheckoutResponse {
  id: string;
}

export default function UpgradePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      alert("Por favor, faça login para continuar.");
      return;
    }

    setIsLoading(true);
    
    const createCheckout = httpsCallable(functions, 'createStripeCheckout');
    
    try {
      // Tipar a resposta da função
      const response = await createCheckout() as { data: CheckoutResponse };
      const sessionId = response.data.id;

      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error("Erro ao criar a sessão de checkout:", error);
      alert("Ocorreu um erro. Por favor, tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-base-200 min-h-screen pb-24">
      <Header />
      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Go Pro</h1>
        <p className="text-lg text-text-light mb-8">Unlock powerful insights and take full control of your finances.</p>
        
        <div className="bg-base-100 rounded-lg shadow-md p-8 space-y-4 text-left">
            <h2 className="text-2xl font-semibold text-text-main mb-4">Pro Plan Features:</h2>
            <ul className="space-y-3">
                <li className="flex items-center gap-3">
                    <CheckCircleIcon className="text-action" />
                    <span>Unlimited Subscriptions</span>
                </li>
                <li className="flex items-center gap-3">
                    <CheckCircleIcon className="text-action" />
                    <span>Detailed Spending Analysis</span>
                </li>
                <li className="flex items-center gap-3">
                    <CheckCircleIcon className="text-action" />
                    <span>AI-Powered Saving Tips (Coming Soon)</span>
                </li>
                <li className="flex items-center gap-3">
                    <CheckCircleIcon className="text-action" />
                    <span>Export Data to CSV</span>
                </li>
            </ul>
            <button 
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full mt-8 bg-primary text-white font-bold py-3 rounded-lg text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Upgrade for €9.99/year"
              )}
            </button>
        </div>
      </main>
      <BottomNavbar onAddClick={() => router.push('/dashboard')} />
    </div>
  );
}