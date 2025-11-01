'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

// Petites helpers
const fmtDate = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
const startOfWeekMonday = (d: Date) => {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay(); // 0=dim ... 6=sam
  const diff = (day === 0 ? -6 : 1 - day); // on va au lundi
  const monday = new Date(x);
  monday.setUTCDate(x.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
};

type Profile = {
  id: string;           // = auth.uid() (clé primaire)
  handle: string | null;
  habit: string | null;
  target: number | null;
};

export default function AppPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkedISO, setCheckedISO] = useState<Set<string>>(new Set()); // dates YYYY-MM-DD cochées
  const [weekStart, setWeekStart] = useState<string>(''); // YYYY-MM-DD de ce lundi

  const days = useMemo(() => ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'], []);
  const dayBoxes = useMemo(() => {
    if (!weekStart) return [];
    const base = new Date(weekStart + 'T00:00:00.000Z');
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(base);
      d.setUTCDate(base.getUTCDate() + i);
      return d;
    });
  }, [weekStart]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // 1) session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.replace('/login');
          return;
        }

        // 2) profil
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('id, handle, habit, target')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profErr) throw profErr;

        // Si pas de profil → onboarding
        if (!prof) {
          router.replace('/onboarding');
          return;
        }

        setProfile(prof as Profile);

        // 3) calcul du lundi (semaine courante)
        const monday = startOfWeekMonday(new Date());
        const mondayISO = fmtDate(monday);
        setWeekStart(mondayISO);

        // 4) fetch des réalisations de la semaine (on ne demande **pas** de colonne `day`)
        const { data: rows, error: progErr } = await supabase
          .from('progress')
          .select('achieved_at')
          .eq('profile_id', prof.id)
          .eq('week_start', mondayISO);

        if (progErr) throw progErr;

        const set = new Set<string>();
        (rows ?? []).forEach(r => {
          const iso = fmtDate(new Date(r.achieved_at));
          set.add(iso);
        });
        setCheckedISO(set);
      } catch (e: any) {
        console.error('[AppPage] load error:', e);
        alert(`Erreur lors du chargement de ton challenge : ${e?.message ?? e}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const toggleDay = async (date: Date) => {
    if (!profile || !weekStart) return;

    const iso = fmtDate(date);
    const already = checkedISO.has(iso);

    try {
      if (already) {
        // supprimer la ligne de ce jour (match sur date(achieved_at))
        const { error } = await supabase
          .from('progress')
          .delete()
          .eq('profile_id', profile.id)
          .eq('week_start', weekStart)
          .gte('achieved_at', iso + 'T00:00:00.000Z')
          .lt('achieved_at', iso + 'T23:59:59.999Z');

        if (error) throw error;

        const next = new Set(checkedISO);
        next.delete(iso);
        setCheckedISO(next);
      } else {
        // insérer une nouvelle réalisation – AUCUNE colonne `day`
        const { error } = await supabase.from('progress').insert({
          profile_id: profile.id,
          week_start: weekStart,
          habit: profile.habit ?? null,
          target: profile.target ?? 7,
          achieved_at: new Date().toISOString(),
          kind: 'check', // si tu veux différencier les types
        });

        if (error) throw error;

        const next = new Set(checkedISO);
        next.add(iso);
        setCheckedISO(next);
      }
    } catch (e: any) {
      console.error('[AppPage] toggle error:', e);
      alert(`Erreur progression : ${e?.message ?? e}`);
    }
  };

  const finishWeek = async () => {
    if (!profile) return;
    try {
      const done = checkedISO.size;
      const target = profile.target ?? 7;

      if (done >= target) {
        // on crée un badge simple (si ta table badges attend profile_id + created_at…)
        await supabase.from('badges').insert({
          profile_id: profile.id,
          created_at: new Date().toISOString(),
        });
        alert('🎉 Objectif atteint : badge ajouté !');
        router.replace('/onboarding');
      } else {
        alert(`Semaine terminée (${done}/${target}).`);
        router.replace('/onboarding');
      }
    } catch (e: any) {
      console.error('[AppPage] finishWeek error:', e);
      alert(`Erreur clôture : ${e?.message ?? e}`);
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-5xl font-bold mb-4">Cette semaine</h1>
        <p>Chargement…</p>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-5xl font-bold mb-4">Cette semaine</h1>

      <section className="mb-6">
        <div className="text-xl">
          <span className="font-semibold">Habitude</span> : {profile.habit ?? '—'} —{' '}
          <span className="font-semibold">Objectif</span> : {profile.target ?? 7}/7
        </div>
      </section>

      <div className="flex gap-4 flex-wrap mb-6">
        {dayBoxes.map((d, idx) => {
          const iso = fmtDate(d);
          const checked = checkedISO.has(iso);
          return (
            <button
              key={iso}
              onClick={() => toggleDay(d)}
              className={`px-10 py-14 rounded-2xl border ${
                checked ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
            >
              <div className="text-2xl font-semibold">{days[idx]}</div>
              <div className="mt-6">{checked ? '✓' : '—'}</div>
            </button>
          );
        })}
      </div>

      <p className="mb-4">Progression : {checkedISO.size}/7</p>

      <button
        onClick={finishWeek}
        className="w-full rounded-2xl bg-black text-white py-4 text-lg"
      >
        Terminer la semaine
      </button>

      <div className="mt-6">
        <a href="/onboarding" className="underline">
          Modifier mon profil
        </a>
      </div>
    </main>
  );
}

