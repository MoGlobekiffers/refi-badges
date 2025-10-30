"use client";
import { useEffect, useState } from "react";
import ShareButtons from "../../components/ShareButtons";
export default function Page({ params }){
  const id=params.id;
  const [title,setTitle]=useState("");
  const [imageUrl,setImageUrl]=useState("");
  const [target,setTarget]=useState(7);
  const [progress,setProgress]=useState(0);
  const [loading,setLoading]=useState(true);
  async function load(){
    setLoading(true);
    const r=await fetch(`/api/badge/get?id=${id}`,{cache:"no-store"});
    const j=await r.json();
    if(r.ok){setTitle(j.title||"Badge");setImageUrl(j.image_url||"");setTarget(Number(j.meta?.target??7));setProgress(Number(j.meta?.progress??0));}
    setLoading(false);
  }
  useEffect(()=>{load();},[id]);
  async function inc(){
    const r=await fetch("/api/badge/progress",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,delta:1})});
    const j=await r.json(); if(r.ok){setProgress(j.progress);}
  }
  const pct=Math.min(100,Math.round((progress/target)*100||0));
  return(<main className="max-w-3xl mx-auto p-6">
    <h1 className="text-3xl font-semibold mb-3">{title}</h1>
    {loading?<p>Loading…</p>:(<>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="opacity-80">Progress: {progress}/{target}</span>
          <span className="opacity-60 text-sm">{pct}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden">
          <div className="h-3 bg-black" style={{width:`${pct}%`}}/>
        </div>
      </div>
      <div className="flex gap-3 mb-6">
        <button onClick={inc} className="px-4 py-2 rounded-xl border font-medium">+1 day</button>
      </div>
      <ShareButtons imageUrl={imageUrl} title={title}/>
    </>)}
  </main>);
}
