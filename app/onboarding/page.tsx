"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [habit, setHabit] = useState("");
  const [target, setTarget] = useState(5);

  useEffect(() => {
    const existing = localStorage.getItem("handle");
    if (existing) router.replace("/app");
  }, [router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!handle || !habit || !target) {
      alert("Remplis tous les champs 🙂");
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        handle: handle.trim(),
        habit,
        target,
        progress: [false, false, false, false, false, false, false],
      })
      .select()
      .single();
    if (error) {
      if ((error as any).code === "23505") {
        alert("Pseudonyme déjà pris, essaie un autre.");
      } else {
        console.error(error);
        alert("Erreur création profil.");
      }
      return;
    }
    localStorage.setItem("handle", data.handle);
    localStorage.setItem("profile_id", data.id);
    router.push("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Onboarding</h1>

        <label className="block text-sm mb-1">Pseudonyme public</label>
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="ex: globekiffers"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          required
        />

        <label className="block text-sm mb-1">Habitude</label>
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="ex: walk 35 mn"
          value={habit}
          onChange={(e) => setHabit(e.target.value)}
          required
        />

        <label className="block text-sm mb-1">Objectif hebdo (1–7)</label>
        <input
          type="number"
          min={1}
          max={7}
          className="w-full border rounded px-3 py-2 mb-6"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          required
        />

        <div className="flex gap-2">
          <button className="flex-1 bg-black text-white py-2 rounded">Save</button>
          <button
            type="button"
            onClick={() => router.push("/app")}
            className="flex-1 border py-2 rounded"
          >
            Go to dashboard
          </button>
        </div>
      </form>
    </div>
  );
}
