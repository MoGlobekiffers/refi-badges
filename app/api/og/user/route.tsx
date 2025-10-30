import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle") ?? "";
  const title = handle ? `@${handle}` : "Profil";
  return new ImageResponse(
    (
      <div style={{ fontSize: 64, padding: 80 }}>
        {title}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
