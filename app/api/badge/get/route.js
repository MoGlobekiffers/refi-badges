import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "../../../lib/supabaseAdmin";
export async function GET(req) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const supa = createSupabaseAdmin();
  const { data } = await supa.from("badges").select("id,title,description,image_url").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  let meta = {};
  try { meta = JSON.parse(data.description || "{}"); } catch { meta = {}; }
  return NextResponse.json({ id: data.id, title: data.title, image_url: data.image_url, meta });
}
