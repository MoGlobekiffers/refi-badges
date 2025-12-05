'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toggleDayServer, claimBadgeServer, resetWeekServer, hardResetServer, getDebugProgress } from '@/app/actions/progress';
import Link from 'next/link';



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
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
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

        // Fetch Badge
        const weekEnd = addDays(weekStart, 7);
        const { data: existingBadge } = await supabase
          .from("badges")
          .select("image_url")
          .eq("profile_id", prof.id)
          .eq("habit", prof.habit) // Filter badge by habit
          .gte("created_at", weekStart.toISOString())
          .lt("created_at", weekEnd.toISOString())
          .single();

        if (existingBadge) setBadgeUrl(existingBadge.image_url);


        // Fetch Progress (Filtered by Habit)
        const { data: progRows, error: progErr } = await supabase
          .from('progress')
          .select('achieved_at')
          .eq('profile_id', prof.id)
          .eq('habit', prof.habit) // Filter progress by habit
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
      // Pass client's weekStart to ensure server uses same reference frame
      const result = await toggleDayServer(iso, weekStart.toISOString());

      if (!result.success) {
        throw new Error(result.error || "Unknown server error");
      }

      // No automatic badge logic here anymore
    } catch (e: any) {
      console.error("Toggle error", e);
      // Rollback
      setCheckedDates(previousSet);
      alert("Error: " + e.message);
    }
  }

  async function handleClaimBadge() {
    try {
      setClaiming(true);
      // Explicitly pass the week start
      const result = await claimBadgeServer(weekStart.toISOString());

      if (!result.success) throw new Error(result.error);

      if (result.badgeUrl) {
        setBadgeUrl(result.badgeUrl);
        const isNew = result.isNew;
        alert(isNew ? "🎉 CERTIFIED! Badge claimed on-chain." : "You already claimed this badge.");

        // Redirect to onboarding as requested
        router.push('/onboarding');
      }
    } catch (e: any) {
      alert("Claim failed: " + e.message);
    } finally {
      setClaiming(false);
    }
  }

  async function handleReset() {
    if (!confirm("Are you sure? This will delete ALL progress for this week.")) return;
    try {
      // Use the memoized weekStart ensures alignment with what user sees
      const res = await resetWeekServer(weekStart.toISOString());
      if (!res.success) throw new Error(res.error);

      setCheckedDates(new Set());
      alert(`Week reset successful. Deleted ${res.count} entries.`);
    } catch (e: any) {
      alert("Reset failed: " + e.message);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 text-neutral-500">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 animate-spin border-t-2 border-emerald-600"></div>
          <p>Loading your progress...</p>
        </div>
      </main>
    );
  }

  const target = profile?.target ?? 7;
  const count = checkedDates.size;
  const progressPercent = Math.min(100, Math.round((count / target) * 100));
  const canClaim = count >= target && !badgeUrl;

  return (
    <main className="min-h-screen bg-neutral-50 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">R</div>
            <span className="font-bold text-lg tracking-tight">ReFi Badges</span>
          </div>

          <Link href="/onboarding" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
            Edit Quest
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Context */}
        <section className="mb-10 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            Current Quest
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-2 capitalize">
            {profile?.habit?.replace(/_/g, ' ') ?? 'My Habit'}
          </h1>
          <p className="text-neutral-500">
            Target: {target} days/week • Proof of Habit
          </p>
        </section>

        {/* Badge Display */}
        {badgeUrl && (
          <div className="mb-10 p-6 border-2 border-emerald-400 bg-emerald-50 rounded-2xl text-center shadow-lg shadow-emerald-100 animate-slide-up">
            <h2 className="text-2xl font-bold text-emerald-800 mb-2">🎉 Quest Validated!</h2>
            <p className="text-emerald-600 mb-6 font-medium">You officially earned your "Proof of Habit".</p>
            <img src={badgeUrl} alt="Badge" className="mx-auto rounded-xl shadow-xl max-w-[180px] border-4 border-white" />
          </div>
        )}

        {/* Manual Claim Button */}
        {canClaim && (
          <div className="mb-10 text-center animate-bounce-slow">
            <button
              onClick={handleClaimBadge}
              disabled={claiming}
              className="bg-neutral-900 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-emerald-200 hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {claiming ? "Verifying..." : "🏆 Validate Quest & Claim Badge"}
            </button>
            <p className="text-sm text-gray-400 mt-3">You reached your target! Click to mint your badge.</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-10 bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <span className="font-bold text-lg">Weekly Progress</span>
            <span className="text-2xl font-mono font-bold text-emerald-600">
              {count}<span className="text-gray-300 text-lg">/{target}</span>
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="mt-4 text-sm text-gray-400 flex justify-between">
            <span>{progressPercent}% Complete</span>

            {/* Dynamic Text Status */}
            <span>
              {count >= target
                ? (badgeUrl ? "Quest Complete!" : "Ready to Claim!")
                : `${target - count} days to go`
              }
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-12">
          {weekDates.map((d, i) => {
            const iso = toISODate(d);
            const checked = checkedDates.has(iso);

            // Anti-cheat: Strict Mode
            const nowIso = toISODate(new Date());
            const isStrictlyFuture = iso > nowIso;
            const isStrictlyPast = iso < nowIso;
            const isLocked = isStrictlyFuture || isStrictlyPast;

            const isToday = iso === nowIso;

            // Styling
            let bgClass = "bg-white border-gray-200 hover:border-gray-300";
            let textClass = "text-gray-400";
            let icon = "";

            if (checked) {
              bgClass = "bg-emerald-500 border-emerald-600 shadow-md shadow-emerald-200 scale-[1.02]";
              textClass = "text-white";
              icon = "✅";
            } else if (isToday) {
              bgClass = "bg-white border-emerald-500 ring-2 ring-emerald-100 ring-offset-2";
              textClass = "text-neutral-900";
              icon = "👇";
            } else if (isStrictlyPast) {
              bgClass = "bg-gray-50 border-gray-100 opacity-60";
              textClass = "text-gray-300";
              icon = "❌"; // Missed
            } else if (isStrictlyFuture) {
              bgClass = "bg-gray-50 border-gray-100 opacity-40";
              textClass = "text-gray-300";
              icon = "🔒";
            }

            return (
              <button
                key={iso}
                disabled={isLocked}
                onClick={() => handleToggle(d)}
                className={`
                            relative flex flex-col items-center justify-center p-3 h-28 rounded-2xl border-2 transition-all duration-200
                            ${bgClass}
                            ${isLocked ? 'cursor-default' : 'cursor-pointer active:scale-95'}
                        `}
              >
                <span className={`text-xs font-bold uppercase mb-2 ${textClass === 'text-white' ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {dayLabels[i]}
                </span>

                <span className={`text-2xl font-bold ${textClass}`}>
                  {new Date(d).getUTCDate()}
                </span>

                {isToday && !checked && (
                  <span className="absolute bottom-2 text-xs font-bold text-emerald-600 animate-bounce">
                    Log
                  </span>
                )}

                {(checked || isLocked) && (
                  <div className="absolute bottom-2 text-base">
                    {icon}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action to Return to Onboarding */}
        <div className="text-center flex flex-col gap-4">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-black transition-all shadow-sm"
          >
            <span>⚙️</span>
            <span>Change Logic / Edit Profile</span>
          </Link>

          <button
            onClick={handleReset}
            className="text-xs text-red-300 hover:text-red-500 underline transition-colors"
          >
            Reset this week's progress
          </button>
        </div>

      </div>
    </main>
  );
}
