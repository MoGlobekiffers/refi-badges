import { ImageResponse } from "next/og";
export const runtime = "nodejs"; // plus stable en dev

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sp = url.searchParams;

    const habit = sp.get("habit") ?? "habit";
    const user = sp.get("user") ?? "user";
    const count = Number(sp.get("count") ?? 0);
    const target = Number(sp.get("target") ?? 7);

    const progress = target > 0 ? Math.min(1, Math.max(0, count / target)) : 0;
    const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));

    // IMPORTANT:
    // - le root a UN SEUL enfant
    // - tout conteneur avec plusieurs enfants a display:"flex"
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            background: "#0f172a",
            color: "#fff",
            // un seul enfant => pas besoin d'être flex ici, mais on le met quand même
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              // ce conteneur a plusieurs enfants -> display:flex obligatoire
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: 80,
              width: "100%",
              height: "100%",
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 40 }}>{habit}</div>

            <div
              style={{
                width: 900,
                height: 28,
                background: "#334155",
                borderRadius: 14,
                overflow: "hidden",
                display: "flex", // sécurité même si un enfant
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: "#22c55e",
                  display: "flex",
                }}
              />
            </div>

            <div style={{ marginTop: 40, fontSize: 36, display: "flex" }}>
              Progress: {count}/{target} ({pct}%)
            </div>

            <div style={{ marginTop: 16, fontSize: 24, display: "flex" }}>
              refi-badges — {user}
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e: any) {
    console.error("[OG ERROR]", e);
    return new Response("OG error: " + (e?.message ?? "unknown"), { status: 500 });
  }
}
