
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
  const { user, loading, SignUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signUpWithEmail(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Try logging in instead.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
      console.error("Erro de registo:", err.message);
    }
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
        <h2 className="text-2xl font-bold text-text-main mb-6 text-center">Create an Account</h2>
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min. 6 characters)" required className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary" />
          {error && <p className="text-error text-sm">{error}</p>}
          <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-text-light mt-6">
          Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}