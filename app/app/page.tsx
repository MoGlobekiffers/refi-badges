"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";

type Profile = {
  id: string;
  handle: string;
  habit: string;
  target: number;
  progress: boolean[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<boolean[]>([false,false,false,false,false,false,false]);
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  useEffect(() => {
    const pid = localStorage.getItem("profile_id");
    if (!pid) { router.replace("/onboarding"); return; }
    supabase.from("profiles").select("*").eq("id", pid).single()
      .then(({data, error}) => {
        if (error || !data) return;
        setProfile(data as Profile);
        setProgress(Array.isArray(data.progress) && data.progress.length===7 ? data.progress : [false,false,false,false,false,false,false]);
      });
  }, [router]);

  const toggle = async (i: number) => {
    if (!profile) return;
    const next = [...progress]; next[i] = !next[i];
    setProgress(next);
    const { error } = await supabase.from("profiles").update({progress: next}).eq("id", profile.id);
    if (error) console.error(error);
  };

  const finishWeek = async () => {
    if (!profile) return;
    const done = progress.filter(Boolean).length;
    if (done < profile.target) { alert(`Pas encore : ${done}/${profile.target}`); return; }
    const { error } = await supabase.from("badges").insert({ profile_id: profile.id });
    if (error) { console.error(error); alert("Création du badge impossible"); return; }
    const empty = [false,false,false,false,false,false,false];
    setProgress(empty);
    await supabase.from("profiles").update({progress: empty}).eq("id", profile.id);
    alert("🎉 Objectif atteint : badge ajouté !");
    router.push(`/u/${profile.handle}`);
  };

  if (!profile) return <p className="p-4 text-center">Chargement…</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">This week</h1>
      <p className="mb-4">Habit: <b>{profile.habit}</b> — Target: <b>{profile.target}/7</b></p>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map((d,i)=>(
          <button
            key={i}
            onClick={()=>toggle(i)}
            className={`h-20 rounded text-white ${progress[i] ? "bg-emerald-500" : "bg-gray-300"}`}
          >
            {d}
          </button>
        ))}
      </div>

      <p className="mb-4">Progress: {progress.filter(Boolean).length}/7</p>
      <button onClick={finishWeek} className="w-full bg-black text-white py-2 rounded">
        Terminer la semaine
      </button>
    </div>
  );
}
