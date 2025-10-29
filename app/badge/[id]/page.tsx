import Image from 'next/image';
import supabase from '@/lib/supabaseAnon';

type RouteParams = { id: string };
type Badge = {
  id: string;
  owner_handle: string;
  title: string;
  progress: number;
  target: number;
  public: boolean;
  url: string | null;
  created_at: string;
};

export default async function Page({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;

  const { data, error } = await supabase
    .from<Badge>('badges')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Badge introuvable</h1>
        <p className="text-neutral-500 mt-2">{error?.message ?? '—'}</p>
      </main>
    );
  }

  const pct = Math.max(
    0,
    Math.min(100, Math.round((data.progress / Math.max(1, data.target)) * 100))
  );

  return (
    <main className="min-h-[60vh] p-6 flex flex-col items-center gap-6">
      <h1 className="text-3xl font-semibold">{data.title}</h1>

      <div className="w-full max-w-2xl">
        <div className="h-3 w-full rounded-full bg-neutral-800">
          <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm text-neutral-400">
          Progress: {data.progress}/{data.target}
        </p>
      </div>

      {data.url ? (
        <Image
          src={data.url}
          alt={data.title}
          width={800}
          height={420}
          className="rounded-xl border border-neutral-800"
          priority
        />
      ) : null}
    </main>
  );
}
