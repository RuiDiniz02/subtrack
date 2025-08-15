// src/app/login/page.tsx

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FirebaseError } from 'firebase/app';

export default function LoginPage() {
  const { user, loading, signInWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmail(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('Invalid email or password.');
        } else {
          setError('Failed to log in. Please try again.');
        }
      } else {
         setError('An unexpected error occurred.');
      }
      console.error("Erro de login:", (err as Error).message);
    }
  };

  // Placeholder para a função de login com Google
  const handleGoogleSignIn = () => {
    alert('Login com Google ainda não implementado.');
  };

  if (loading || user) {
    return <div className="flex items-center justify-center h-screen bg-base-200">Redirecting...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="p-8 bg-base-100 rounded-lg shadow-md w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-logo font-bold text-primary">
            Subtrack
          </Link>
        </div>
        <h2 className="text-2xl font-bold text-text-main mb-6 text-center">Welcome Back</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary" />
          {error && <p className="text-error text-sm">{error}</p>}
          <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
            Login
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-secondary"></div>
          <span className="flex-shrink mx-4 text-text-light text-sm">OR</span>
          <div className="flex-grow border-t border-secondary"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center gap-3 w-full bg-white border border-secondary text-text-main font-semibold py-3 px-6 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.9 0 6.9 1.6 9.1 3.7l6.9-6.9C35.9 2.5 30.5 0 24 0 14.9 0 7.3 5.4 3 13.2l8.4 6.5c1.8-5.4 6.7-9.2 12.6-9.2z"></path><path fill="#34A853" d="M46.2 25.1c0-1.6-.1-3.2-.4-4.7H24v9h12.5c-.5 2.9-2.2 5.4-4.7 7.1l7.3 5.7c4.3-4 6.9-10 6.9-17.1z"></path><path fill="#FBBC05" d="M11.4 28.1c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-8.4-6.5C1.1 15.8 0 19.8 0 24s1.1 8.2 3 11.5l8.4-6.9z"></path><path fill="#EA4335" d="M24 48c6.5 0 12-2.1 15.9-5.7l-7.3-5.7c-2.1 1.4-4.8 2.3-7.6 2.3-5.9 0-10.8-3.8-12.6-9.2l-8.4 6.5C7.3 42.6 14.9 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
          Continue with Google
        </button>
        <p className="text-center text-sm text-text-light mt-6">
          Don&apos;t have an account? <Link href="/signup" className="font-semibold text-primary hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}