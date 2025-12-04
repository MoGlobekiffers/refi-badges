'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { useState } from 'react';

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      // Déconnexion Supabase
      await supabase.auth.signOut();
      // (optionnel) purge du storage si tu utilises persistSession
      try {
        localStorage.removeItem('sb-:session');
      } catch { }
      // Redirection vers /login
      router.push('/login');
    } catch (e) {
      alert("Impossible de se déconnecter. Réessaie.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition text-sm"
      aria-label="Se déconnecter"
      title="Se déconnecter"
    >
      <LogOut className="h-4 w-4" />
      {loading ? 'Déconnexion…' : 'Se déconnecter'}
    </button>
  );
}

