"use client";
import { useState } from "react";
const presets = ["Walk 30 min","Cycle commute","Recycle daily","Pick up litter","Volunteer","No-meat day","Cold wash"];
export default function NewBadge(){
  const [title,setTitle]=useState(presets[0]);
  const [handle,setHandle]=useState("test");
  const [target,setTarget]=useState(3);
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState("");
  async function submit(e){
    e.preventDefault(); setBusy(true); setErr("");
    const r=await fetch("/api/badge/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,handle,target})});
    const j=await r.json(); if(!r.ok){setErr(j.error||"error");setBusy(false);return;}
    location.href=`/badge/${j.id}`;
  }
  return(<main className="max-w-xl mx-auto p-6">
    <h1 className="text-3xl font-semibold mb-4">Create a habit</h1>
    <form onSubmit={submit} className="space-y-5">
      <div><label className="block text-sm mb-1">Preset</label>
        <div className="flex flex-wrap gap-2">
          {presets.map(p=>(<button type="button" key={p} onClick={()=>setTitle(p)} className={`px-3 py-1 rounded-xl border ${title===p?'bg-black text-white':''}`}>{p}</button>))}
        </div>
      </div>
      <div><label className="block text-sm mb-1">Custom title</label><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded-xl px-3 py-2"/></div>
      <div><label className="block text-sm mb-1">Handle</label><input value={handle} onChange={e=>setHandle(e.target.value)} className="w-full border rounded-xl px-3 py-2"/></div>
      <div><label className="block text-sm mb-1">Days per week: {target}</label><input type="range" min="1" max="7" value={target} onChange={e=>setTarget(Number(e.target.value))} className="w-full"/></div>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <button disabled={busy} className="px-4 py-2 rounded-xl border font-medium">{busy?"Creating...":"Create badge"}</button>
    </form>
  </main>);
}
