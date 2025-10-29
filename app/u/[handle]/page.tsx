import { supabaseAnon } from '@/lib/supabaseAnon'

export default async function UserBadges({ params }: { params: { handle: string } }) {
  const { data: badges, error } = await supabaseAnon
    .from('badges')
    .select('id,title,progress,target,habit_slug,image_key,url,created_at')
    .eq('owner_handle', params.handle)
    .eq('public', true)
    .order('created_at', { ascending: false })

  if (error) return <pre>Erreur: {error.message}</pre>
  if (!badges?.length) return <main className="p-6">Aucun badge public pour @{params.handle}</main>

  return (
    <main className="p-6">
      <h1 className="text-2xl mb-4">@{params.handle} — Badges</h1>
      <ul className="grid gap-3">
        {badges.map(b => (
          <li key={b.id}>
            <a href={`/badge/${b.id}`} className="underline">
              {b.title} ({b.progress}/{b.target})
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
