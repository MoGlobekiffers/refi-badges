"use client";
import { useState } from "react";
export default function NewBadge() {
  const [title,setTitle]=useState("My Habit");
  const [handle,setHandle]=useState("test");
  const [target,setTarget]=useState(3);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const onSubmit=async(e)=>{e.preventDefault();setLoading(true);setError("");try{
    const r=await fetch("/api/badge/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,handle,target})});
    const j=await r.json(); if(!r.ok) throw new Error(j.error||"error");
    window.location.href=`/badge/${j.id}`;
  }catch(err){setError(String(err.message||err))}finally{setLoading(false)}};
  return (<main className="max-w-xl mx-auto p-6">
    <h1 className="text-3xl font-semibold mb-4">Create a habit</h1>
    <form onSubmit={onSubmit} className="space-y-4">
      <div><label className="block text-sm mb-1">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded-xl px-3 py-2"/></div>
      <div><label className="block text-sm mb-1">Handle</label><input value={handle} onChange={e=>setHandle(e.target.value)} className="w-full border rounded-xl px-3 py-2"/></div>
      <div><label className="block text-sm mb-1">Days per week</label><input type="number" min="1" max="7" value={target} onChange={e=>setTarget(Number(e.target.value))} className="w-full border rounded-xl px-3 py-2"/></div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button disabled={loading} className="px-4 py-2 rounded-xl border font-medium">{loading?"Creating...":"Create badge"}</button>
    </form>
  </main>);
}
