"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";

type Profile = { id: string; handle: string; habit: string; target: number; progress: boolean[]; };

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile|null>(null);
  const [progress, setProgress] = useState<boolean[]>([false,false,false,false,false,false,false]);
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  useEffect(() => {
    const pid = localStorage.getItem("profile_id");
    if (!pid) { router.replace("/onboarding"); return; }
    supabase.from("profiles").select("*").eq("id", pid).single()
      .then(({data}) => { if (data){ setProfile(data as Profile); setProgress(Array.isArray(data.progress)&&data.progress.length===7?data.progress:[false,false,false,false,false,false,false]); }});
  }, [router]);

  const toggle = async (i:number) => {
    if (!profile) return;
    const next = [...progress]; next[i]=!next[i];
    setProgress(next);
    await supabase.from("profiles").update({progress: next}).eq("id", profile.id);
  };

  const finishWeek = async () => {
    if (!profile) return;
    const done = progress.filter(Boolean).length;
    if (done < profile.target) { alert(`Pas encore : ${done}/${profile.target}`); return; }
    await supabase.from("badges").insert({ profile_id: profile.id });
    const empty = [false,false,false,false,false,false,false];
    setProgress(empty);
    await supabase.from("profiles").update({progress: empty}).eq("id", profile.id);
    alert("🎉 Objectif atteint : badge ajouté !");
    router.push(`/u/${profile.handle}`);
  };

  if (!profile) return <p className="p-4 text-center">Chargement…</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold mb-4">This week</h1>
      <p className="mb-6 text-xl">Habit: <b>{profile.habit}</b> — Target: <b>{profile.target}/7</b></p>
      <div className="grid grid-cols-7 gap-3 mb-6">
        {days.map((d,i)=>(
          <button key={i} onClick={()=>toggle(i)} className={`h-28 rounded text-white text-2xl ${progress[i] ? "bg-emerald-500" : "bg-gray-300"}`}>{d}</button>
        ))}
      </div>
      <p className="mb-4 text-xl">Progress: {progress.filter(Boolean).length}/7</p>
      <button onClick={finishWeek} className="w-full bg-black text-white py-3 rounded text-xl">Terminer la semaine</button>
    </div>
  );
}
