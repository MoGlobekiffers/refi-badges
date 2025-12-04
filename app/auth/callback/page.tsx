'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';

import { Suspense } from 'react';

function AuthCallbackContent() {
  const router = useRouter();
  const search = useSearchParams();
  const [msg, setMsg] = useState('Connexion en cours…');

  useEffect(() => {
    (async () => {
      try {
        // Cas A : MAGIC LINK (token dans le fragment #access_token=…)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          // Supabase v2 detects session automatically from URL
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (data.session) {
            setMsg('Connecté ✅');
            router.replace('/onboarding');
            return;
          }
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

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
