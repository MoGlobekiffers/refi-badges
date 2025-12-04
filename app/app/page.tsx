'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { toggleDayServer } from '@/app/actions/progress';

type Profile = {
  id: string;
  habit: string | null;
  target: number | null;
};

function startOfWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
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
  return d.toISOString().slice(0, 10);
}

export default function AppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkedDates, setCheckedDates] = useState<Set<string>>(new Set());
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null);

  const weekStart = useMemo(() => startOfWeek(new Date()), []);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
          router.replace('/login');
          return;
        }

        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('id, habit, target')
          .eq('id', auth.user.id)
          .single();

        if (profErr || !prof) {
          router.replace('/onboarding');
          return;
        }
        setProfile(prof);

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
          const iso = toISODate(new Date(r.achieved_at));
          set.add(iso);
        });
        setCheckedDates(set);
      } catch (e: any) {
        console.error('[AppPage] load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, weekStart]);

  async function handleToggle(day: Date) {
    const iso = toISODate(day);

    // Optimistic UI
    const previousSet = new Set(checkedDates);
    const newSet = new Set(checkedDates);
    if (newSet.has(iso)) newSet.delete(iso);
    else newSet.add(iso);
    setCheckedDates(newSet);

    try {
      const result = await toggleDayServer(iso);

      if (result.badgeUrl) {
        setBadgeUrl(result.badgeUrl);
        alert("🎉 Badge Unlocked! Check your profile.");
      }
    } catch (e) {
      console.error("Toggle error", e);
      // Rollback
      setCheckedDates(previousSet);
      alert("Error updating progress");
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center">
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

      {badgeUrl && (
        <div className="mb-8 p-4 border-2 border-green-400 bg-green-50 rounded-xl text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-2">Congratulations!</h2>
          <img src={badgeUrl} alt="Badge" className="mx-auto rounded-lg shadow-lg max-w-xs" />
        </div>
      )}

      <div className="grid grid-cols-7 gap-4 mb-6">
        {weekDates.map((d, i) => {
          const iso = toISODate(d);
          const checked = checkedDates.has(iso);
          return (
            <button
              key={iso}
              onClick={() => handleToggle(d)}
              className={[
                'rounded-2xl border px-2 py-4 sm:px-6 sm:py-8 text-center transition-all',
                checked ? 'bg-green-200 border-green-300 scale-105' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
              ].join(' ')}
            >
              <div className="text-sm sm:text-xl font-semibold mb-2 sm:mb-6">{dayLabels[i]}</div>
              <div className="text-xl sm:text-2xl">{checked ? '✅' : '—'}</div>
            </button>
          );
        })}
      </div>

      <p className="mb-4 text-center text-gray-500">
        Progress : {checkedDates.size}/{profile?.target ?? 7}
      </p>

      <div className="mt-12 text-center">
        <a href="/onboarding" className="text-sm text-gray-400 underline">
          Edit my profile
        </a>
      </div>
    </main>
  );
}

