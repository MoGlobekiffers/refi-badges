'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

type Profile = {
  id: string;
  habit: string;
  target: number;
};

type ProgressRow = {
  id: string;
  achieved_day: string; // 'YYYY-MM-DD'
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// --- utils de date : semaine qui commence le lundi (en UTC) ---
function getWeekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay(); // 0=dimanche, 1=lundi...
  const diff = (day + 6) % 7; // nb de jours depuis lundi
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

export default function AppPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [days, setDays] = useState<boolean[]>(Array(7).fill(false));

  // nombre de jours cochés
  const completedCount = days.filter(Boolean).length;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // 1) Utilisateur connecté ?
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('[AppPage] user error:', userError);
        router.push('/login');
        return;
      }

      // 2) Profil
      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('id, habit, target')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        console.error('[AppPage] profile error:', profileError);
        router.push('/onboarding');
        return;
      }

      const safeProfile: Profile = {
        id: profileData.id,
        habit: profileData.habit ?? 'My habit',
        target: profileData.target ?? 1,
      };
      setProfile(safeProfile);

      // 3) Progression de la semaine courante
      const now = new Date();
      const weekStart = getWeekStart(now);
      const nextWeekStart = addDays(weekStart, 7);
      const weekStartISO = toISODate(weekStart);
      const nextWeekStartISO = toISODate(nextWeekStart);

      const {
        data: progressRows,
        error: progressError,
      } = await supabase
        .from('progress')
        .select('id, achieved_day')
        .eq('profile_id', safeProfile.id)
        .gte('achieved_day', weekStartISO)
        .lt('achieved_day', nextWeekStartISO);

      if (progressError) {
        console.error('[AppPage] progress load error:', progressError);
        alert(
          `Progress load error: ${
            (progressError as any)?.message ?? JSON.stringify(progressError)
          }`,
        );
        setDays(Array(7).fill(false));
        return;
      }

      const newDays = Array(7).fill(false) as boolean[];

      if (progressRows && progressRows.length > 0) {
        for (const row of progressRows as ProgressRow[]) {
          if (!row.achieved_day) continue;

          const d = new Date(row.achieved_day + 'T00:00:00Z');
          const diffDays = Math.round(
            (d.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000),
          );

          if (diffDays >= 0 && diffDays < 7) {
            newDays[diffDays] = true;
          }
        }
      }

      setDays(newDays);
    } catch (e) {
      console.error('[AppPage] load error:', e);
      alert(`Error while loading your challenge: ${(e as any)?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }

  // toggle d’un jour
  async function toggleDay(index: number) {
    if (!profile) return;

    const today = new Date();
    const weekStart = getWeekStart(today);
    const weekStartISO = toISODate(weekStart);
    const dayDate = addDays(weekStart, index);
    const dayISO = toISODate(dayDate);

    // Optimistic UI
    let newValue: boolean;
    setDays((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      newValue = copy[index];
      return copy;
    });

    try {
      if (newValue!) {
        // on coche -> insert
        const { error } = await supabase.from('progress').insert({
          profile_id: profile.id,
          week_start: weekStartISO,
          achieved_day: dayISO,
        });

        if (error) {
          console.error('[AppPage] toggle insert error:', error);
          alert(
            `Progress error: ${
              (error as any).message ?? JSON.stringify(error)
            }`,
          );
          // revert
          setDays((prev) => {
            const copy = [...prev];
            copy[index] = !copy[index];
            return copy;
          });
        }
      } else {
        // on décoche -> delete
        const { error } = await supabase
          .from('progress')
          .delete()
          .eq('profile_id', profile.id)
          .eq('achieved_day', dayISO);

        if (error) {
          console.error('[AppPage] toggle delete error:', error);
          alert(
            `Progress error: ${
              (error as any).message ?? JSON.stringify(error)
            }`,
          );
          // revert
          setDays((prev) => {
            const copy = [...prev];
            copy[index] = !copy[index];
            return copy;
          });
        }
      }
    } catch (e) {
      console.error('[AppPage] toggle unexpected error:', e);
      alert(`Unexpected progress error: ${(e as any)?.message ?? e}`);
      // revert
      setDays((prev) => {
        const copy = [...prev];
        copy[index] = !copy[index];
        return copy;
      });
    }
  }

  // bouton "Finish the week"
  async function handleFinishWeek() {
    if (!profile) return;

    if (completedCount < profile.target) {
      alert(
        `You planned ${profile.target} day(s) but you only completed ${completedCount}.`,
      );
      return;
    }

    try {
      // 1) badge
      const { error: badgeError } = await supabase.from('badges').insert({
        profile_id: profile.id,
        title: `Weekly goal reached`,
      });

      if (badgeError) {
        console.error('[AppPage] badge insert error:', badgeError);
        alert(
          `Badge error: ${
            (badgeError as any).message ?? JSON.stringify(badgeError)
          }`,
        );
        return;
      }

      alert('🎉 Goal reached: badge added!');

      // 2) on envoie l’utilisateur sur /onboarding pour choisir une nouvelle quête
      //    et on ne touche pas aux données ici (le reset se fait dans /onboarding)
      router.push('/onboarding');
    } catch (e) {
      console.error('[AppPage] finish week error:', e);
      alert(`Error while finishing the week: ${(e as any)?.message ?? e}`);
    }
  }

  if (loading || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      <section className="w-full max-w-5xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">This week</h1>
          <p className="text-lg">
            <span className="font-semibold">Habit:</span> {profile.habit} —{' '}
            <span className="font-semibold">Goal:</span> {profile.target}/7
          </p>
        </header>

        <section className="mb-6 flex gap-4 overflow-x-auto">
          {DAY_LABELS.map((label, index) => {
            const active = days[index];
            return (
              <button
                key={label}
                onClick={() => toggleDay(index)}
                className={[
                  'flex flex-col items-center justify-center rounded-2xl w-28 h-40 border text-lg font-semibold',
                  active
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-gray-50 text-gray-900 border-gray-200 hover:border-gray-400',
                ].join(' ')}
              >
                <span className="mb-4">{label}</span>
                <span className="text-2xl">{active ? '✓' : '–'}</span>
              </button>
            );
          })}
        </section>

        <p className="mb-6 text-lg font-semibold">
          Progress: {completedCount}/{profile.target}
        </p>

        <button
          onClick={handleFinishWeek}
          className="w-full max-w-3xl block mx-auto mb-6 rounded-full py-4 px-6 text-center text-white text-lg font-semibold bg-black hover:bg-gray-900"
        >
          Finish the week
        </button>

        <Link href="/onboarding" className="underline text-sm">
          Edit my profile
        </Link>
      </section>
    </main>
  );
}

