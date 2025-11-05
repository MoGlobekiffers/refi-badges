'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const sendLink = async () => {
    try {
      const clean = email.trim();
      if (!clean) {
        alert('Please enter your email.');
        return;
      }

      setSending(true);

      const { error } = await supabase.auth.signInWithOtp({
        email: clean,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      alert('Magic link sent ✅ — please check your inbox.');
    } catch (e) {
      console.error('[Login] error:', e);
      alert(`Login error: ${(e as any)?.message ?? e}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      <label className="block text-sm font-medium mb-1">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full mb-4 rounded border px-3 py-2"
      />

      <button
        onClick={sendLink}
        disabled={sending}
        className="w-full rounded bg-black text-white px-4 py-2 disabled:opacity-60"
      >
        {sending ? 'Sending magic link…' : 'Send magic link'}
      </button>
    </main>
  );
}

