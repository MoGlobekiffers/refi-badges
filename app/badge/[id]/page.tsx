import { cookies } from "next/headers";
import { createSupabaseServer } from "../../src/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";
export const revalidate = 60;
type Props = { params: { id: string } };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServer(cookies());
  const { data: b } = await supabase.from("badges").select("title,description,image_url").eq("id", params.id).eq("is_public", true).maybeSingle();
  const title = b ? `${b.title} — RefiBadge` : "Badge introuvable";
  const desc = b?.description ?? "Badge Refi";
  const image = b?.image_url ?? `/api/og/badge?id=${params.id}`;
  const url = `/badge/${params.id}`;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, images: [{ url: image }] },
    twitter: { card: "summary_large_image" }
  };
}
export default async function Page({ params }: Props) {
  const supabase = createSupabaseServer(cookies());
  const { data: b } = await supabase.from("badges").select("id,title,description,image_url, owner:owner_id (handle)").eq("id", params.id).eq("is_public", true).maybeSingle();
  if (!b) return <main className="p-6">Badge introuvable.</main>;
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">{b.title}</h1>
      {b.image_url && <img src={b.image_url} alt={b.title} className="rounded-xl mb-4" />}
      <p className="opacity-80 mb-4">{b.description}</p>
      <Link href={`/u/${b.owner?.handle}`} className="underline">@{b.owner?.handle}</Link>
    </main>
  );
}
