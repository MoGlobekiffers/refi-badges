import Link from "next/link";
import { createSupabaseAdmin } from "../../lib/supabaseAdmin";

export const revalidate = 60;

export default async function UserPage({ params }) {
  const supa = createSupabaseAdmin();
  const { data: profile } = await supa
    .from("profiles")
    .select("id,display_name,handle")
    .eq("handle", params.handle)
    .maybeSingle();

  if (!profile) return <main className="p-6">Profil introuvable.</main>;

  const { data: badges } = await supa
    .from("badges")
    .select("id,title,image_url")
    .eq("owner_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-1">@{profile.handle}</h1>
      <p className="opacity-70 mb-6">{profile.display_name}</p>
      <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(badges || []).map((b) => (
          <li key={b.id} className="rounded-xl border p-4">
            <div className="mb-2 font-medium">{b.title}</div>
            <Link href={`/badge/${b.id}`} className="underline">Open</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
