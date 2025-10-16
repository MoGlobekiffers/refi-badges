"use client";
import { useEffect, useState } from "react";
import WeekGrid from "@/components/WeekGrid";

export default function Dashboard() {
  const [habit, setHabit] = useState<string>("");
  const [target, setTarget] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const h = localStorage.getItem("rb_habit_name") || "";
      const t = Number(localStorage.getItem("rb_week_target") || 0);
      setHabit(h);
      setTarget(t);
    } catch {}
    setLoaded(true);
  }, []);

  return (
    <main className="p-6">
      <p className="mb-2 text-sm opacity-70">Dashboard — 7-day grid (WIP)</p>

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


