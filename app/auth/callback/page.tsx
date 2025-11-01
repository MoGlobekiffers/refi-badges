'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const search = useSearchParams();
  const [msg, setMsg] = useState('Connexion en cours…');

  useEffect(() => {
    (async () => {
      try {
        // Cas A : MAGIC LINK (token dans le fragment #access_token=…)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (error) throw error;
          setMsg('Connecté ✅');
          router.replace('/onboarding');
          return;
        }

        // Cas B : OAuth PKCE (?code=…)
        const code = search.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setMsg('Connecté ✅');
          router.replace('/onboarding');
          return;
        }

        // Cas C : Erreur renvoyée par Supabase dans la query
        const err = search.get('error_description') || search.get('error');
        if (err) {
          setMsg('Erreur : ' + err);
          return;
        }

        // Rien dans l’URL → lien invalide/expiré
        setMsg('Lien invalide ou expiré. Réessaye depuis la page de connexion.');
      } catch (e: any) {
        setMsg('Erreur : ' + (e?.message ?? 'inconnue'));
      }
    })();
  }, [router, search]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-3">Redirection…</h1>
      <p>{msg}</p>
    </main>
  );
}

