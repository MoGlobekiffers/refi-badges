import supabase from '@/lib/supabaseAnon';

type RouteParams = { handle: string };

export default async function Page({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { handle } = await params;

  const { data, error } = await supabase
    .from('badges')
    .select('id, title, progress, target, public')
    .eq('owner_handle', handle)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">/u/{handle}</h1>
        <p className="text-red-400 mt-2">Erreur: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">/u/{handle}</h1>
      <ul className="space-y-2">
        {(data ?? []).map((b) => {
          const pct = Math.max(
            0,
            Math.min(100, Math.round((b.progress / Math.max(1, b.target)) * 100))
          );
          return (
            <li key={b.id} className="p-3 rounded border border-neutral-800">
              <a href={`/badge/${b.id}`} className="font-medium underline">
                {b.title}
              </a>
              <div className="mt-2 h-2 rounded bg-neutral-800">
                <div
                  className="h-2 rounded bg-emerald-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-sm text-neutral-400 mt-1">
                {b.progress}/{b.target} — {b.public ? 'public' : 'privé'}
              </p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
