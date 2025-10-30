import Link from "next/link";
import { cookies } from "next/headers";
import { createSupabaseServer } from "../lib/supabase";

export const revalidate = 60;

export const metadata = {
  title: "RefiBadge — Galerie publique",
  description: "Parcourez les badges publics.",
  alternates: { canonical: "/badges" },
  openGraph: { title: "RefiBadge — Galerie publique", description: "Parcourez les badges publics.", url: "/badges", images: [{ url: "/api/og/badge?gallery=1" }] },
  twitter: { card: "summary_large_image" }
};

export default async function Page() {
  const supabase = createSupabaseServer(cookies());
  const { data: badges } = await supabase
    .from("badges")
    .select("id,title,description,image_url,created_at, owner:owner_id (handle)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Galerie publique</h1>
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {(badges ?? []).map((b) => (
          <li key={b.id} className="border rounded-xl p-4">
            <Link href={`/badge/${b.id}`} className="text-lg font-medium">{b.title}</Link>
            <p className="text-sm opacity-80 line-clamp-2">{b.description}</p>
            <Link href={`/u/${b.owner?.handle}`} className="text-xs underline mt-2 block">@{b.owner?.handle}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
