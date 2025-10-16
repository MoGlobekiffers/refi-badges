"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import WeekGrid from "@/components/WeekGrid";

export default function Dashboard() {
  const [habit, setHabit] = useState<string>("");
  const [target, setTarget] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // récupérer la session
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    // lire habit/target en local
    try {
      const h = localStorage.getItem("rb_habit_name") || "";
      const t = Number(localStorage.getItem("rb_week_target") || 0);
      setHabit(h);
      setTarget(t);
    } catch {}
    setLoaded(true);

    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="p-6">
      <p className="mb-2 text-sm opacity-70">Dashboard — 7-day grid (WIP)</p>

      <div className="mb-4 text-sm">
        {email ? (
          <div className="flex items-center gap-3">
            <span>Signed in as <b>{email}</b></span>
            <button onClick={logout} className="px-3 py-1 border rounded">Sign out</button>
          </div>
        ) : (
          <a href="/login" className="underline text-blue-600">Sign in (magic link)</a>
        )}
      </div>

      {!loaded ? (
        <p>Loading…</p>
      ) : habit ? (
        <div className="mb-4">
          <div className="text-xl font-semibold">This week</div>
          <div className="opacity-80">
            Habit: <b>{habit}</b> — Target: <b>{target}/7</b>
          </div>
        </div>
      ) : (
        <a href="/onboarding" className="underline text-blue-600 mb-4 inline-block">
          Set your habit & weekly target →
        </a>
      )}

      <WeekGrid />
    </main>
  );
}

