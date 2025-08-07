'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    }
  };

  if (loading || user) {
    return <div className="flex items-center justify-center h-screen bg-base-200">A redirecionar...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="p-8 bg-base-100 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-text-main mb-6">Aceder à Subtrack</h1>
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center gap-3 w-full bg-white border border-secondary text-text-main font-semibold py-3 px-6 rounded-lg hover:bg-secondary transition-colors"
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.9 0 6.9 1.6 9.1 3.7l6.9-6.9C35.9 2.5 30.5 0 24 0 14.9 0 7.3 5.4 3 13.2l8.4 6.5c1.8-5.4 6.7-9.2 12.6-9.2z"></path><path fill="#34A853" d="M46.2 25.1c0-1.6-.1-3.2-.4-4.7H24v9h12.5c-.5 2.9-2.2 5.4-4.7 7.1l7.3 5.7c4.3-4 6.9-10 6.9-17.1z"></path><path fill="#FBBC05" d="M11.4 28.1c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-8.4-6.5C1.1 15.8 0 19.8 0 24s1.1 8.2 3 11.5l8.4-6.9z"></path><path fill="#EA4335" d="M24 48c6.5 0 12-2.1 15.9-5.7l-7.3-5.7c-2.1 1.4-4.8 2.3-7.6 2.3-5.9 0-10.8-3.8-12.6-9.2l-8.4 6.5C7.3 42.6 14.9 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
          Continuar com Google
        </button>
      </div>
    </div>
  );
}
