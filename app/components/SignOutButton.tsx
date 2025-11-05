"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      // 1) tentative "classique"
      const { error } = await supabase.auth.signOut();

      // 2) Fallback si la 1) renvoie une erreur (session absente/expirée, etc.)
      if (error) {
        // on tente le scope local, qui retire les infos côté client
        await supabase.auth.signOut({ scope: "local" });
      }

      // 3) Nettoyage défensif (au cas où)
      try {
        localStorage.removeItem("supabase.auth.token");
      } catch {}

      // 4) Redirection vers login
      router.replace("/login");
    } catch (e: any) {
      alert(`Sign-out error: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-xl bg-gray-200 px-4 py-2 text-gray-900"
      aria-label="Sign out"
      title="Sign out"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}

