'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const sendLink = async () => {
    setLoading(true);
    setMessage(null);

    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Magic link sent! Check your inbox (and spam).' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-neutral-900 font-sans">
      {/* Left side: Context & Branding */}
      <div className="md:w-1/2 bg-gradient-to-br from-emerald-900 to-green-800 text-white p-12 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-emerald-900 font-bold">R</div>
            <span className="text-xl font-bold tracking-tight">ReFi Badges</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Build habits.<br />
            Earn impact.<br />
            On-chain.
          </h1>

          <p className="text-lg md:text-xl text-emerald-100 max-w-md opacity-90 mb-8">
            Join the movement of regenerative finance. Track your daily eco-actions, prove your consistency as "Proof of Habit", and earn verifies badges on the Celo blockchain.
          </p>

          <div className="flex gap-4 text-sm font-medium text-emerald-200">
            <span className="flex items-center gap-1">🌱 Carbon Negative</span>
            <span className="flex items-center gap-1">⛓️ Celo Network</span>
            <span className="flex items-center gap-1">📱 Mobile First</span>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 text-emerald-100/60 text-sm font-medium">
          Built with Love by GlobeKiffers
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-neutral-500 mb-8">Enter your email to access your dashboard.</p>

          {message && (
            <div className={`p-4 rounded-xl mb-6 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                disabled={loading}
              />
            </div>

            <button
              onClick={sendLink}
              disabled={loading || !email}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200"
            >
              {loading ? 'Sending link...' : 'Send Magic Link'}
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-neutral-400">
            No password required. We'll verify you via email.
          </p>
        </div>
      </div>
    </div>
  );
}

