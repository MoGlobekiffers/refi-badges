import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "../../../lib/supabaseAdmin";
export async function POST(req) {
  const { title, handle, target } = await req.json();
  if (!title || !handle || !target) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const supa = createSupabaseAdmin();
  const { data: profile } = await supa.from("profiles").select("id").eq("handle", handle).maybeSingle();
  if (!profile) return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  const desc = JSON.stringify({ target: Math.max(1, Math.min(7, Number(target))), progress: 0 });
  const { data, error } = await supa.from("badges").insert([{ title, description: desc, owner_id: profile.id, is_public: true, image_url: `/api/og/badge?id=temp` }]).select("id").single();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
