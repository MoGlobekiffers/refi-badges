import { ImageResponse } from "next/og";
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  const { data: badge } = await supabase
    .from("badges")
    .select("id, profile_id, created_at")
    .eq("id", id)
    .single();

  if (!badge) {
    return new ImageResponse(
      (
        <div style={{
          fontSize: 40, color: "#fff", background: "#737373",
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          Badge introuvable
        </div>
      ),
      { width: 400, height: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("habit,target")
    .eq("id", badge.profile_id)
    .single();

  return new ImageResponse(
    (
      <div style={{
        fontSize: 36, color: "#fff", background: "#2563EB",
        width: "100%", height: "100%", padding: "20px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center"
      }}>
        <div style={{ fontSize: "4rem" }}>🏅</div>
        <div style={{ fontWeight: 700, marginTop: 10 }}>Objectif atteint !</div>
        <div style={{ marginTop: 6 }}>{profile?.habit ?? "Habitude"}</div>
        <div style={{ marginTop: 2 }}>{profile?.target ?? 0} jours/sem.</div>
      </div>
    ),
    { width: 400, height: 400 }
  );
}
