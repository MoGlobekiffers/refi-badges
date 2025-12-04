import { NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { supabaseServer } from "@/lib/supabaseServer";
import { slugify } from "@/lib/slugify";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { habit, user, count, target } = body;

    if (!habit || !user || count === undefined || target === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (count < target) {
      return NextResponse.json({ ok: false, message: "Target not reached" });
    }

    // 1. Generate PNG buffer
    const element = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "white",
          border: "20px solid #4ade80",
        }}
      >
        <div style={{ display: "flex", fontSize: 48, marginBottom: 20 }}>Refi Badge Unlocked!</div>
        <div style={{ display: "flex", fontSize: 80, fontWeight: "bold" }}>{habit}</div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 20 }}>
          Awarded to {user}
        </div>
      </div>
    );

    const imageResponse = new ImageResponse(element, { width: 1200, height: 630 });
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Upload to Supabase
    const supabase = supabaseServer();
    const filename = `${slugify(user)}-${slugify(habit)}-${Date.now()}.png`;
    const bucket = process.env.SUPABASE_BUCKET || "badges";

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    const publicUrl = publicUrlData.publicUrl;

    // 4. Insert into Badges table (if profileId is provided)
    // We use the same supabase client (service role) so it bypasses RLS if needed, 
    // but here we are just inserting.
    const { profileId } = body;
    if (profileId) {
      await supabase.from("badges").insert({
        profile_id: profileId,
        habit: habit,
        target: target,
        image_url: publicUrl,
        kind: "weekly",
      });
    }

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      path: data.path,
    });

  } catch (e: any) {
    console.error("Generate error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
