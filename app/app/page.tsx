'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { HABITS } from '@/utils/habits';

type Profile = {
  id: string;
  habit: string | null;
  target: number | null;
};

type Day = {
  date: string;     // YYYY-MM-DD
  label: string;    // Mon/Tue/...
  done: boolean;
  inFuture: boolean;
};

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0 = Sun
  const diff = (day === 0 ? -6 : 1) - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ChallengeAppPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [weekStart, setWeekStart] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // profil
      const { data: p } = await supabase
        .from('profiles')
        .select('id, habit, target')
        .eq('id', user.id)
        .maybeSingle();

      if (!p) { router.push('/onboarding'); return; }
      setProfile(p);

      // semaine
      const start = startOfWeek(new Date());
      const ws = fmt(start);
      setWeekStart(ws);

      const arr: Day[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const today = new Date(); today.setHours(0,0,0,0);
        arr.push({
          date: fmt(d),
          label: d.toLocaleDateString(undefined, { weekday: 'short' }),
          done: false,
          inFuture: d > today,
        });
      }

      // progress existant
      const { data: prog } = await supabase
        .from('progress')
        .select('day, done')
        .eq('profile_id', user.id)
        .eq('week_start', ws);

      if (prog && prog.length) {
        for (const row of prog) {
          const idx = arr.findIndex(x => x.date === row.day);
          if (idx >= 0) arr[idx].done = !!row.done;
        }
      }
      setDays(arr);
      setLoading(false);
    })();
  }, [router]);

  const doneCount = useMemo(() => days.filter(d => d.done).length, [days]);
  const target = profile?.target ?? 0;

  const toggleDay = async (idx: number) => {
    const d = days[idx];
    if (d.inFuture) return; // pas de cochage futur

    const newArr = [...days];
    newArr[idx] = { ...d, done: !d.done };
    setDays(newArr);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('progress').upsert({
      profile_id: user.id,
      week_start: weekStart,
      day: d.date,
      done: !d.done,
    });
    if (error) alert(`Erreur progression: ${error.message}`);
  };

  const finishWeek = async () => {
    const reached = doneCount >= target && target > 0;
    if (reached) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('badges').insert({
        profile_id: user.id,
        habit: profile?.habit ?? 'habit',
        target: target,
        week_start: weekStart,
        achieved_at: new Date().toISOString(),
        kind: 'weekly-goal',
      });
      if (error) {
        alert(`Erreur badge: ${error.message}`);
      } else {
        alert('🎉 Objectif atteint : badge ajouté !');
        // retour onboarding pour choisir une nouvelle quête
        router.push('/onboarding');
      }
    } else {
      alert(`Semaine terminée (${doneCount}/${target}).`);
      router.push('/onboarding');
    }
  };

  if (loading) return <div className="p-8">Chargement…</div>;

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-5xl font-bold mb-4">This week</h1>
      <p className="text-xl mb-6">
        <span className="font-semibold">Habit</span> : {profile?.habit ?? '—'} —{' '}
        <span className="font-semibold">Target</span> : {target}/7
      </p>

      <div className="flex gap-4 flex-wrap mb-6">
        {days.map((d, i) => (
          <button
            key={d.date}
            onClick={() => toggleDay(i)}
            className={`w-28 h-36 rounded-xl border text-center flex flex-col items-center justify-center
              ${d.done ? 'bg-green-500 text-white' : 'bg-gray-200'}
              ${d.inFuture ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={d.inFuture}
          >
            <div className="text-lg font-semibold">{d.label}</div>
            <div className="mt-2">{d.done ? '✅' : '—'}</div>
          </button>
        ))}
      </div>

      <p className="mb-6 text-lg">Progress : {doneCount}/7</p>

      <button
        onClick={finishWeek}
        className="w-full px-6 py-5 rounded-xl bg-black text-white text-xl"
      >
        Terminer la semaine
      </button>
    </main>
  );
}

