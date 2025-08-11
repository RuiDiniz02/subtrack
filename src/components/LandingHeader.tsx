
'use client';

import Link from 'next/link';

export default function LandingHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10">
      <div className="max-w-5xl mx-auto p-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-logo font-bold text-primary">
          Subtrack
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-text-light font-semibold hover:text-primary transition-colors">
            Login
          </Link>
          <Link href="/login" className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}
