'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { HABITS } from '@/utils/habits';
import SignOutButton from '@/components/SignOutButton';

type Profile = {
  id: string;
  handle: string | null;
  habit: string | null;
  target: number | null;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [handle, setHandle] = useState('');
  const [habit, setHabit] = useState(HABITS[0]?.id ?? '');
  const [target, setTarget] = useState<number>(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, handle, habit, target')
        .eq('id', user.id)
        .maybeSingle();

      if (error) console.error(error);
      if (data) {
        setProfile(data);
        setHandle(data.handle ?? '');
        if (data.habit) setHabit(data.habit);
        if (data.target) setTarget(data.target);
      }
      setLoading(false);
    })();
  }, [router]);

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const upsert = {
      id: user.id,
      handle: handle || null,
      habit: habit || null,
      target: target ?? 0,
    };

    const { error } = await supabase.from('profiles').upsert(upsert);
    if (error) {
      alert(`Erreur profil: ${error.message}`);
      return;
    }
    alert('Profil enregistré ✅');
  };

  const goToChallenge = () => router.push('/app');

  if (loading) return <div className="p-8">Chargement…</div>;

  return (
  <main className="max-w-3xl mx-auto p-6">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-4xl font-bold">Onboarding</h1>
      <SignOutButton />
    </div>


      {/* Bloc challenge en cours */}
      <section className="mb-8 rounded-xl border p-4 bg-white">
        <h2 className="text-xl font-semibold mb-2">Mon challenge</h2>
        <p className="text-sm text-gray-600 mb-4">
          Ton profil est complet. Tu peux rejoindre ton challenge.
        </p>
        <button
          onClick={goToChallenge}
          className="px-5 py-4 rounded-xl bg-black text-white"
        >
          Mon challenge en cours
        </button>
      </section>

      {/* Formulaire profil */}
      <section className="rounded-xl border p-4 bg-white">
        <h3 className="text-lg font-semibold mb-4">Configurer le profil</h3>

        <label className="block mb-2 text-sm font-medium">Pseudonyme (handle)</label>
        <input
          className="w-full mb-4 rounded-lg border p-3"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="ton pseudo"
        />

        <label className="block mb-2 text-sm font-medium">Habitude / Quête</label>
        <select
          className="w-full mb-4 rounded-lg border p-3"
          value={habit}
          onChange={(e) => setHabit(e.target.value)}
        >
          {HABITS.map(h => (
            <option key={h.id} value={h.id}>
              {h.label}{h.celo ? ' · celo' : ''}{h.proof ? ' · 📎' : ''}
            </option>
          ))}
        </select>

        <label className="block mb-2 text-sm font-medium">Objectif / semaine</label>
        <input
          type="number"
          className="w-full mb-6 rounded-lg border p-3"
          value={target}
          min={1}
          max={7}
          onChange={(e) => setTarget(Number(e.target.value))}
        />

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={saveProfile}
            className="px-5 py-4 rounded-xl bg-black text-white"
          >
            Enregistrer
          </button>
          <button
            onClick={() => router.push('/app')}
            className="px-5 py-4 rounded-xl bg-gray-100"
          >
            Voir /app
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          📎 = preuve recommandée (photo, capture, reçu). &nbsp;•&nbsp;
          🟡 celo = aligné avec l’écosystème Celo / futur mint de badge.
        </p>
      </section>
    </main>
  );
}

