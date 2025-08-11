
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import LandingHeader from '@/components/LandingHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <div className="flex items-center justify-center h-screen bg-base-200">Loading...</div>;
  }
  
  return (
    <div className="bg-base-100 text-text-main min-h-screen">
      <LandingHeader />
      <main className="max-w-5xl mx-auto px-6 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-text-main">
              Earn more. Paying less.
            </h1>
            <p className="mt-6 text-lg text-text-light max-w-md">
              Subtrack organizes everything for you.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/login" className="bg-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity cursor-pointer">
                Let&apos;s begin
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <Image 
              src="https://placehold.co/400x600/4F46E5/FFFFFF?text=Subtrack+App"
              alt="Subtrack App Example on a phone"
              width={400}
              height={600}
              className="rounded-2xl shadow-2xl"
              priority
              unoptimized={true}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
