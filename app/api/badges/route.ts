import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user = (url.searchParams.get("user") ?? "").trim().toLowerCase();
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supa = supabaseServer();
    let query = supa.from("badges")
      .select("user_slug,habit_slug,target,url,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (user) query = query.eq("user_slug", user);

    const { data, count, error } = await query;
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, page, limit, total: count ?? 0, items: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
