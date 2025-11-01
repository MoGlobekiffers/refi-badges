'use client';
import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');

  const sendLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // doit matcher EXACTEMENT l’URL de redirection configurée côté Supabase
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });
    if (error) alert('Erreur: ' + error.message);
    else alert('Link sent ✅ — check your inbox.');
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sign in</h1>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full border px-3 py-2 rounded mb-3"
      />
      <button onClick={sendLink} className="w-full bg-black text-white py-3 rounded">
        Get magic link
      </button>
    </main>
  );
}

