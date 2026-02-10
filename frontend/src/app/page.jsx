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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 via-pink-500 to-red-500">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-purple-600 via-pink-500 to-red-500 text-white">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-6xl font-bold">ChatApp</h1>
        <p className="text-xl text-white text-opacity-90">
          Real-time messaging with private rooms and direct chats
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white bg-opacity-20 backdrop-blur-lg border border-white border-opacity-30 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all"
          >
            Register
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
            <h3 className="text-xl font-semibold mb-2">Private Rooms</h3>
            <p className="text-white text-opacity-80">Create or join rooms with unique codes</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
            <h3 className="text-xl font-semibold mb-2">Direct Messages</h3>
            <p className="text-white text-opacity-80">Chat directly by email address</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
            <h3 className="text-xl font-semibold mb-2">Real-time</h3>
            <p className="text-white text-opacity-80">See typing and online status instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
}