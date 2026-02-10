'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-xl font-medium animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
      <div className="w-full max-w-6xl px-6 py-12 flex flex-col items-center text-center">
        {/* Hero Section */}
        <div className="max-w-3xl space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
            Connect Seamlessly with <span className="text-green-600">Talkito</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A private messaging platform
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Link
              href="/login"
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}