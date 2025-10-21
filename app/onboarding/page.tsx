"use client";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import Link from "next/link";

export default function Onboarding() {
  const [habit, setHabit] = useState("");
  const [target, setTarget] = useState<number>(3);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // 1) si user connecté, essaie de charger le profil Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("habit, week_target")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!error && data) {
            if (data.habit) setHabit(data.habit);
            if (data.week_target) setTarget(Number(data.week_target));
            return; // on a trouvé en DB
          }
        }
        // 2) sinon, fallback localStorage
        const h = localStorage.getItem("rb_habit_name");
        const t = localStorage.getItem("rb_week_target");
        if (h) setHabit(h);
        if (t) setTarget(Number(t));
      } catch {}
    })();
  }, []);

  async function save() {
    if (!habit.trim()) {
      alert("Please enter a habit (ex: Walk 20 minutes)");
      return;
    }
    if (target < 1 || target > 7) {
      alert("Weekly target must be between 1 and 7!");
      return;
    }

    // Toujours enregistrer en local (offline OK)
    localStorage.setItem("rb_habit_name", habit.trim());
    localStorage.setItem("rb_week_target", String(target));
    setSaved(true);

    // Si connecté → upsert en DB
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("profiles").upsert({
          user_id: user.id,
          habit: habit.trim(),
          week_target: target,
          updated_at: new Date().toISOString(),
        });
        if (error) console.error("profiles upsert error:", error);
      }
    } catch (err) {
      console.error("save profile error:", err);
    }
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

