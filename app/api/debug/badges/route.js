export const runtime = "nodejs";
import { createClient } from "@supabase/supabase-js";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const supa = admin();

    const { data: profile } = await supa
      .from("profiles")
      .select("id,handle")
      .eq("handle", "test")
      .maybeSingle();

    const { data: lastPublic } = await supa
      .from("badges")
      .select("id,title,is_public,owner_id,created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: lastAny } = await supa
      .from("badges")
      .select("id,title,is_public,owner_id,created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    return new Response(
      JSON.stringify({
        env: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
        profileTest: profile || null,
        publicBadges: lastPublic || [],
        anyBadges: lastAny || [],
      }, null, 2),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
