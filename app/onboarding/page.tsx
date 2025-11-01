'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { HABITS } from '@/utils/habits';
// Si tu as le composant de déconnexion, dé-commente la ligne suivante :
// import SignOutButton from '@/components/SignOutButton';

type Profile = {
  id: string;
  handle: string | null;
  habit: string | null;
  target: number | null;
};

export default function OnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [handle, setHandle] = useState<string>('');
  const [habit, setHabit] = useState<string>('');
  const [target, setTarget] = useState<number>(1);

  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
          router.replace('/login');
          return;
        }

        const { data: prof, error } = await supabase
          .from('profiles')
          .select('id, handle, habit, target')
          .eq('id', auth.user.id)
          .single();

        if (error) throw error;

        const p = prof as Profile;
        setProfileId(p.id);
        setHandle(p.handle ?? '');
        setHabit(p.habit ?? (HABITS[0]?.value ?? ''));
        setTarget(p.target ?? 1);
      } catch (e) {
        console.error(e);
        alert('Error while loading your profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const saveProfile = async () => {
    try {
      if (!profileId) return;

      const { error } = await supabase.from('profiles').update({
        handle: handle || null,
        habit: habit || null,
        target: target || 1,
      }).eq('id', profileId);

      if (error) throw error;

      alert('Profile saved ✅');
    } catch (e) {
      console.error(e);
      alert('Save error.');
    }
  };

  const openApp = () => router.push('/app');

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6">Onboarding</h1>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Onboarding</h1>
        {/* Dé-commente si tu utilises le composant */}
        {/* <SignOutButton /> */}
      </div>

      {/* Card d’accès au challenge */}
      <section className="rounded-xl border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">My challenge</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Your profile is complete. You can join your challenge.
        </p>

        <button
          onClick={openApp}
          className="px-5 py-4 rounded-xl bg-black text-white"
        >
          My current challenge
        </button>

        {/* (optionnel) tu peux afficher l’id pour debug */}
        {/* <p className="text-xs text-neutral-400 mt-3">userId: {profileId}</p> */}
      </section>

      {/* Formulaire profil */}
      <section className="rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Configure profile</h3>

        {/* Handle */}
        <label className="block text-sm font-medium mb-2">Handle</label>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 mb-6"
          placeholder="your name/nickname"
        />

        {/* Habit / Quest */}
        <label className="block text-sm font-medium mb-2">Habit / Quest</label>
        <select
          value={habit}
          onChange={(e) => setHabit(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 mb-6"
        >
          {HABITS.map((h) => (
            <option key={h.value} value={h.value}>
              {h.label}
            </option>
          ))}
        </select>

        {/* Target / week */}
        <label className="block text-sm font-medium mb-2">Target / week</label>
        <input
          type="number"
          min={1}
          max={7}
          value={target}
          onChange={(e) => setTarget(parseInt(e.target.value || '1', 10))}
          className="w-full rounded-lg border px-3 py-2 mb-6"
        />

        <div className="flex gap-3">
          <button
            onClick={saveProfile}
            className="px-5 py-3 rounded-xl bg-black text-white"
          >
            Save
          </button>
          <button
            onClick={openApp}
            className="px-5 py-3 rounded-xl bg-gray-100"
          >
            Open app
          </button>
        </div>

        {/* Légende d’alignement Celo / preuve (si tu l’utilises) */}
        <div className="text-xs text-neutral-500 mt-6">
          <span className="mr-2">📎 = proof recommended (photo, receipt, capture).</span>
          <span>🟡 celo = aligned with the Celo ecosystem / future badge mint.</span>
        </div>
      </section>
    </main>
  );
}

