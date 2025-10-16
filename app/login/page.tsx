"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getAppOrigin } from '@/lib/safeOrigin';

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink() {
    setError(null);
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

const redirectTo = `${getAppOrigin()}/auth/callback`;


    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>

      {sent ? (
        <p className="text-green-600">
          Magic link sent! Check your inbox and click the link.
        </p>
      ) : (
        <>
          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.org"
            className="w-full border rounded p-2 mb-4"
          />
          <button onClick={sendLink} className="px-4 py-2 rounded bg-black text-white">
            Send magic link
          </button>
          {error && <p className="text-red-600 mt-3">{error}</p>}
        </>
      )}
    </main>
  );
}

