'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Déconnexion Supabase
      await supabase.auth.signOut();
      // Redirection vers la page de login
      router.replace('/login');
    } catch (e) {
      console.error(e);
      alert("Impossible de se déconnecter pour le moment.");
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm font-medium"
      aria-label="Se déconnecter"
    >
      Se déconnecter
    </button>
  );
}

