import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "../../../lib/supabaseAdmin";
export async function POST(req) {
  const { id, delta } = await req.json();
  const supa = createSupabaseAdmin();
  const { data: b } = await supa.from("badges").select("id,description").eq("id", id).maybeSingle();
  if (!b) return NextResponse.json({ error: "not_found" }, { status: 404 });
  let meta = {};
  try { meta = JSON.parse(b.description || "{}"); } catch { meta = {}; }
  const target = Number(meta.target ?? 7);
  const progress = Math.max(0, Math.min(target, Number(meta.progress ?? 0) + (Number(delta) || 1)));
  meta.target = target; meta.progress = progress;
  const { error } = await supa.from("badges").update({ description: JSON.stringify(meta) }).eq("id", id);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ id, target, progress });
}
