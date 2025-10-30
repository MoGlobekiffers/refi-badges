'use client'
export default async function Page({ params }) {
  const handle = params.handle;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const pRes = await fetch(
    `${url}/rest/v1/profiles?select=id,display_name&handle=eq.${encodeURIComponent(handle)}&limit=1`,
    { headers: { apikey: anon } }
  );
  const profileArr = pRes.ok ? await pRes.json() : [];
  const profile = profileArr[0];
  if (!profile) return <main className="p-6">Profil introuvable.</main>;

  const bRes = await fetch(
    `${url}/rest/v1/badges?select=id,title&owner_id=eq.${profile.id}&order=created_at.desc`,
    { headers: { apikey: anon } }
  );
  const badges = bRes.ok ? await bRes.json() : [];

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold">@{handle}</h1>
      <ul className="grid gap-4 sm:grid-cols-2 mt-6">
        {badges.map((b) => (
          <li key={b.id} className="border rounded-xl p-4">
            <a href={`/badge/${b.id}`} className="font-medium underline">Open</a>
            <div className="opacity-80 mt-2">{b.title}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
