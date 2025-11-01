'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

type Profile = {
  id: string;        // = auth.uid()
  habit: string | null;
  target: number | null;
};

function startOfWeek(d = new Date()) {
  // lundi = premier jour (0=dimanche, 1=lundi…)
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day); // recule jusqu’au lundi
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

function toISODate(d: Date) {
  // YYYY-MM-DD (UTC)
  return d.toISOString().slice(0, 10);
}

export default function AppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkedDates, setCheckedDates] = useState<Set<string>>(new Set());

  const weekStart = useMemo(() => startOfWeek(new Date()), []);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ---- Chargement du profil + progression de la semaine
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) {
          router.replace('/login');
          return;
        }

        // 1) Profil
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('id, habit, target')
          .eq('id', user.id)
          .single();

        if (profErr || !prof) {
          // Pas de profil -> onboarding
          router.replace('/onboarding');
          return;
        }
        setProfile(prof);

        // 2) Progress de la semaine (on lit par achieved_at ∈ [weekStart, weekEnd[ )
        const weekEnd = addDays(weekStart, 7);
        const { data: progRows, error: progErr } = await supabase
          .from('progress')
          .select('achieved_at')
          .eq('profile_id', prof.id)
          .gte('achieved_at', weekStart.toISOString())
          .lt('achieved_at', weekEnd.toISOString());

        if (progErr) throw progErr;

        const set = new Set<string>();
        (progRows ?? []).forEach((r: { achieved_at: string }) => {
          // normalise en YYYY-MM-DD (UTC)
          const iso = toISODate(new Date(r.achieved_at));
          set.add(iso);
        });
        setCheckedDates(set);
      } catch (e: any) {
        // on logge pour le dev, et on montre un message clair à l’utilisateur
        console.error('[AppPage] load error:', e);
        alert(`Error while loading your challenge: ${e?.message ?? e}`);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleDay(day: Date) {
    try {
      if (!profile) return;

      const iso = toISODate(day);
      const newSet = new Set(checkedDates);

      if (newSet.has(iso)) {
        // uncheck => on delete la ligne de ce jour
        const { error } = await supabase
          .from('progress')
          .delete()
          .eq('profile_id', profile.id)
          .gte('achieved_at', new Date(iso + 'T00:00:00.000Z').toISOString())
          .lt('achieved_at', new Date(iso + 'T23:59:59.999Z').toISOString());

        if (error) throw error;

        newSet.delete(iso);
        setCheckedDates(newSet);
      } else {
        // check => on insert la ligne
        const { error } = await supabase.from('progress').insert({
          profile_id: profile.id,
          achieved_at: new Date(iso + 'T09:00:00.000Z'), // heure neutre
          week_start: toISODate(weekStart), // stocké en date (optionnel selon ton schéma)
          kind: 'weekly',                    // optionnel
          habit: profile.habit ?? null,      // optionnel
          target: profile.target ?? null     // optionnel
        });

        if (error) throw error;

        newSet.add(iso);
        setCheckedDates(newSet);
      }
    } catch (e: any) {
      console.error('[AppPage] toggleDay error:', e);
      alert(`Progress error: ${e?.message ?? e}`);
    }
  }

  async function finishWeek() {
    try {
      if (!profile) return;

      const done = checkedDates.size;
      const target = profile.target ?? 0;

      if (done >= target && target > 0) {
        // Objectif atteint => on crée un badge
        const { error } = await supabase.from('badges').insert({
          profile_id: profile.id,
          habit: profile.habit ?? null,
          target: target,
          achieved_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          kind: 'weekly'
        });
        if (error) throw error;

        alert('Goal reached 🎉 — badge added!');
      } else {
        alert(`Week finished (${done}/${target}).`);
      }

      // retour vers l’onboarding (tableau de bord)
      router.push('/onboarding');
    } catch (e: any) {
      console.error('[AppPage] finishWeek error:', e);
      alert(`Finish error: ${e?.message ?? e}`);
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6">This week</h1>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">This week</h1>

      <section className="mb-6">
        <p className="text-lg">
          <span className="font-semibold">Habit</span> : {profile?.habit ?? '—'} —{' '}
          <span className="font-semibold">Target</span> : {profile?.target ?? 0}/7
        </p>
      </section>

      <div className="grid grid-cols-7 gap-4 mb-6">
        {weekDates.map((d, i) => {
          const iso = toISODate(d);
          const checked = checkedDates.has(iso);
          return (
            <button
              key={iso}
              onClick={() => toggleDay(d)}
              className={[
                'rounded-2xl border px-6 py-8 text-center',
                checked ? 'bg-green-200 border-green-300' : 'bg-gray-100 border-gray-200'
              ].join(' ')}
            >
              <div className="text-xl font-semibold mb-6">{dayLabels[i]}</div>
              <div className="text-2xl">{checked ? '✅' : '—'}</div>
            </button>
          );
        })}
      </div>

      <p className="mb-4">Progress : {checkedDates.size}/7</p>

      <button
        onClick={finishWeek}
        className="w-full rounded-2xl bg-black text-white py-5 text-lg"
      >
        Finish the week
      </button>

      <div className="mt-6">
        <a href="/onboarding" className="underline">
          Edit my profile
        </a>
      </div>
    </main>
  );
}

