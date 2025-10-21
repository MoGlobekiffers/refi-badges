import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const sp = u.searchParams;
    const habit = sp.get("habit") ?? "habit";
    const user = sp.get("user") ?? "user";
    const count = Number(sp.get("count") ?? 0);
    const target = Number(sp.get("target") ?? 7);
    const progress = target > 0 ? Math.min(1, Math.max(0, count / target)) : 0;
    const pct = Math.round(progress * 100);
    return NextResponse.json({ ok: true, habit, user, count, target, pct });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 });
  }
}
