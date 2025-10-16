"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Onboarding() {
  const [habit, setHabit] = useState("");
  const [target, setTarget] = useState<number>(3);
  const [saved, setSaved] = useState(false);

  // Pré-remplissage si déjà enregistré
  useEffect(() => {
    try {
      const h = localStorage.getItem("rb_habit_name");
      const t = localStorage.getItem("rb_week_target");
      if (h) setHabit(h);
      if (t) setTarget(Number(t));
    } catch {}
  }, []);

  function save() {
    if (!habit.trim()) {
      alert("Please enter a habit (ex: Walk 20 minutes)");
      return;
    }
    if (target < 1 || target > 7) {
      alert("Weekly target must be between 1 and 7");
      return;
    }
    localStorage.setItem("rb_habit_name", habit.trim());
    localStorage.setItem("rb_week_target", String(target));
    setSaved(true);
  }

  return (
    <main className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Onboarding</h1>

      <label className="block mb-2 font-medium">Habit</label>
      <input
        value={habit}
        onChange={(e) => setHabit(e.target.value)}
        placeholder="Ex: Walk 20 minutes"
        className="w-full border rounded p-2 mb-4"
      />

      <label className="block mb-2 font-medium">Weekly target (1–7)</label>
      <input
        type="number"
        min={1}
        max={7}
        value={target}
        onChange={(e) => setTarget(Number(e.target.value))}
        className="w-full border rounded p-2 mb-4"
      />

      <div className="flex gap-3">
        <button onClick={save} className="px-4 py-2 rounded bg-black text-white">
          Save
        </button>
        <Link href="/app" className="px-4 py-2 rounded border">
          Go to dashboard
        </Link>
      </div>

      {saved && (
        <p className="mt-3 text-green-600">
          Saved! You can now go to the dashboard.
        </p>
      )}
    </main>
  );
}

