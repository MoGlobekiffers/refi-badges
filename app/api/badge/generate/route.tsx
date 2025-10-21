import { NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { supabaseServer } from "@/lib/supabaseServer";
import { slugify } from "@/lib/slugify";

export const runtime = "nodejs";

// --- Rate limit très simple (en mémoire) ---
const WINDOW_MS = 60_000;
const MAX_REQ = 10;
type Stamp = { t: number; n: number };
const RL = (globalThis as any).__rl || new Map<string, Stamp>();
(globalThis as any).__rl = RL;

function tooMany(ip: string) {
  const now = Date.now();
  const s = RL.get(ip);
  if (!s || now - s.t > WINDOW_MS) { RL.set(ip, { t: now, n: 1 }); return false; }
  s.n += 1; s.t = now;
  return s.n > MAX_REQ;
}
function clientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
// --------------------------------------------

function errMsg(e: unknown) {
  if (e instanceof Error) return e.message;
  return typeof e === "string" ? e : "unknown";
}

function Badge(props: { habit: string; user: string; count: number; target: number }) {
  const { habit, user, count, target } = props;
  const progress = target > 0 ? Math.min(1, Math.max(0, count / target)) : 0;
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));

  return (
    <div style={{ width:1200, height:630, background:"#0f172a", color:"#fff",
                  display:"flex", alignItems:"stretch", justifyContent:"center", fontFamily:"sans-serif" }}>
      <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", padding:80, width:"100%", height:"100%" }}>
        <div style={{ fontSize:64, marginBottom:40 }}>{habit}</div>
        <div style={{ width:900, height:28, background:"#334155", borderRadius:14, overflow:"hidden", display:"flex", alignItems:"center" }}>
          <div style={{ width:`${pct}%`, height:"100%", background:"#22c55e", display:"flex" }} />
        </div>
        <div style={{ marginTop:40, fontSize:36, display:"flex" }}>Progress: {count}/{target} ({pct}%)</div>
        <div style={{ marginTop:16, fontSize:24, display:"flex" }}>refi-badges — {user}</div>
      </div>
    </div>
  );
}

export async function POST(req: Request) {
  try {
    // rate limit
    const ip = clientIp(req.headers);
    if (tooMany(ip)) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const habit = String(body["habit"] ?? "habit");
    const user = String(body["user"] ?? "user");
    const count = Number(body["count"] ?? 0);
    const target = Number(body["target"] ?? 7);

    if (!Number.isFinite(count) || !Number.isFinite(target)) {
      return NextResponse.json({ ok: false, error: "bad_numbers" }, { status: 400 });
    }
    if (count < target) {
      return NextResponse.json({ ok: false, error: "target_not_reached" }, { status: 400 });
    }

    const image = new ImageResponse(<Badge habit={habit} user={user} count={count} target={target} />, { width: 1200, height: 630 });
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = supabaseServer();
    const bucket = process.env.SUPABASE_BUCKET!;
    const filePath = `${slugify(user) || "user"}/${slugify(habit) || "habit"}-${target}.png`;

    const { error: upErr } = await supabase.storage.from(bucket).upload(filePath, buffer, {
      contentType: "image/png",
      upsert: true,
    });
    if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return NextResponse.json({ ok: true, url: pub.publicUrl, path: filePath });
  } catch (e: unknown) {
    console.error("[/api/badge/generate] error:", e);
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
