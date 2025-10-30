'use client'
export default async function Page() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const r = await fetch(
    `${url}/rest/v1/badges?select=id,title&is_public=eq.true&order=created_at.desc&limit=50`,
    { headers: { apikey: anon } }
  );
  const data = r.ok ? await r.json() : [];
  return (
    <main className="p-6">
      <h1 className="text-5xl font-semibold mb-6">Galerie publique</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {data.map((b) => (
          <div key={b.id} className="rounded-3xl border p-6">
            <p className="text-2xl mb-4">{b.title}</p>
            <a href={`/badge/${b.id}`} className="underline">Open</a>
          </div>
        ))}
      </div>
    </main>
  );
}
