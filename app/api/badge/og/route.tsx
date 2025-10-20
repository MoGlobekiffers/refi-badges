import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const habit  = searchParams.get("habit")  ?? "Habit";
  const count  = Number(searchParams.get("count")  ?? 0);
  const target = Number(searchParams.get("target") ?? 7);
  const user   = searchParams.get("user")   ?? "anon";

  const pct = Math.max(0, Math.min(100, Math.round((count / Math.max(1, target)) * 100)));

  return new ImageResponse(
    (
      // ⚠️ Un seul parent, et chaque conteneur avec >1 enfant a display:flex
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 32,
          padding: 64,
          background: "#0b1220",
          color: "white",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 48,
        }}
      >
        {/* Titre (1 enfant) */}
        <div style={{ display: "flex" }}>{habit}</div>

        {/* Barre de progression (2 enfants → display:flex) */}
        <div
          style={{
            width: "80%",
            height: 28,
            borderRadius: 14,
            overflow: "hidden",
            background: "rgba(255,255,255,.15)",
            display: "flex",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              background: "#22c55e",
            }}
          />
        </div>

        {/* Texte progression (1 enfant) */}
        <div style={{ display: "flex", fontSize: 36 }}>
          Progress: {count}/{target}
        </div>

        {/* Watermark (1 enfant) */}
        <div style={{ display: "flex", opacity: 0.6, fontSize: 28 }}>
          refi-badges — {user}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
