'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-base-200">A carregar...</div>;
  }

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-6 text-center">
      <h1 className="text-5xl font-bold text-primary mb-4">Bem-vindo à Subtrack</h1>
      <p className="text-xl text-text-light max-w-2xl mb-8">
        Assuma o controlo das suas subscrições. Saiba exatamente quanto gasta e descubra onde pode poupar.
      </p>
      <Link href="/login" className="bg-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity cursor-pointer">
        Começar Agora
      </Link>
    </div>
  );
}
