import { cookies } from "next/headers";
import { createSupabaseServer } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";
export const revalidate = 60;
type Props = { params: { handle: string } };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServer(cookies());
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("handle", params.handle).maybeSingle();
  const title = profile ? `${profile.display_name ?? "Profil"} — @${params.handle}` : "Utilisateur introuvable";
  return {
    title,
    description: `Badges publics de @${params.handle}`,
    alternates: { canonical: `/u/${params.handle}` },
    openGraph: { title, description: `Badges publics de @${params.handle}`, url: `/u/${params.handle}`, images: [{ url: `/api/og/user?handle=${params.handle}` }] },
    twitter: { card: "summary_large_image" }
  };
}
export default async function Page({ params }: Props) {
  const supabase = createSupabaseServer(cookies());
  const [{ data: profile }, { data: badges }] = await Promise.all([
    supabase.from("profiles").select("id,handle,display_name").eq("handle", params.handle).maybeSingle(),
    supabase.from("badges").select("id,title,description,created_at").eq("is_public", true).order("created_at", { ascending: false })
  ]);
  if (!profile) return <main className="p-6">Profil introuvable.</main>;
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">@{params.handle}</h1>
      <p className="opacity-80 mb-4">{profile.display_name}</p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {(badges ?? []).map((b: any) => (
          <li key={b.id} className="border rounded-xl p-4">
            <Link href={`/badge/${b.id}`} className="font-medium">{b.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
