import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.has("gallery") ? "Galerie des badges" : "RefiBadge";
  return new ImageResponse(
    (
      <div style={{ fontSize: 64, padding: 80, width: "100%", height: "100%", display: "flex" }}>
        {title}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
