import { ImageResponse } from "next/server";
import { supabase } from "../../../utils/supabase";
export const runtime = "edge";
export async function GET(_req: Request, { params }: { params: { id: string }}) {
  const { data: badge } = await supabase.from("badges").select("id, profile_id, created_at").eq("id", params.id).single();
  if (!badge) return new ImageResponse((<div style={{fontSize:40,color:"#fff",background:"#737373",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>Badge introuvable</div>),{width:400,height:400});
  const { data: profile } = await supabase.from("profiles").select("habit,target").eq("id", badge.profile_id).single();
  return new ImageResponse((<div style={{fontSize:36,color:"#fff",background:"#2563EB",width:"100%",height:"100%",padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
    <div style={{fontSize:"4rem"}}>🏅</div>
    <div style={{fontWeight:700,marginTop:10}}>Objectif atteint !</div>
    <div style={{marginTop:6}}>{profile?.habit ?? "Habitude"}</div>
    <div style={{marginTop:2}}>{profile?.target ?? 0} jours/sem.</div>
  </div>),{width:400,height:400});
}
