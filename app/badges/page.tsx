// @ts-nocheck
import Image from "next/image";

type SP = Record<string, string | string[] | undefined>;

async function getData(sp: SP) {
  const user = (sp.user as string | undefined) ?? "";
  const page = (sp.page as string | undefined) ?? "1";
  const url = "/api/badges?" + new URLSearchParams({ user, page, limit: "20" }).toString();
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch badges");
  return res.json();
}

// ✅ Next 15: searchParams est (optionnel) mais typé Promise<...>
export default async function BadgesPage(
  { searchParams }: { searchParams?: Promise<SP> }
) {
  const sp: SP = searchParams ? await searchParams : {};
  const data = await getData(sp);

  const items: Array<{ user_slug: string; habit_slug: string; target: number; url: string; created_at: string }> = data.items ?? [];
  const page = Number(data.page ?? 1);
  const total = Number(data.total ?? 0);
  const limit = Number(data.limit ?? 20);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const user = (sp.user as string | undefined) ?? "";

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Badges</h1>

      <form method="get" style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          type="text"
          name="user"
          defaultValue={user}
          placeholder="Filtrer par user_slug (ex: mo)"
          style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, flex: 1 }}
        />
        <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: "black", color: "white" }}>Filtrer</button>
      </form>

      {items.length === 0 && <div>Aucun badge pour ce filtre.</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        {items.map((b, idx) => (
          <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 6 }}>
              {b.user_slug} / {b.habit_slug} — target {b.target} — {new Date(b.created_at).toLocaleString()}
            </div>
            <div style={{ position: "relative", width: "100%", maxWidth: 900, aspectRatio: "1200 / 630" }}>
              <Image
                src={b.url}
                alt={`${b.habit_slug}-${b.target}`}
                fill
                sizes="(max-width: 900px) 100vw, 900px"
                style={{ objectFit: "cover", borderRadius: 8 }}
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          {page > 1 && (
            <a href={`?${new URLSearchParams({ user, page: String(page - 1) }).toString()}`} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb" }}>← Précédent</a>
          )}
          <div style={{ padding: "6px 10px" }}>Page {page} / {totalPages}</div>
          {page < totalPages && (
            <a href={`?${new URLSearchParams({ user, page: String(page + 1) }).toString()}`} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb" }}>Suivant →</a>
          )}
        </div>
      )}
    </main>
  );
}
