/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import { supabaseAnon } from '@/lib/supabaseAnon'

// Métadonnées OG/Twitter
export async function generateMetadata({ params }: { params: { id: string }}) {
  const { data: b } = await supabaseAnon
    .from('badges')
    .select('title')
    .eq('id', params.id)
    .eq('public', true)
    .single()

  const title = b ? `${b.title} | ReFi Badges` : 'ReFi Badges'
  const og = `/badge/${params.id}/opengraph-image`

  return {
    title,
    openGraph: { title, images: [og] },
    twitter:   { card: 'summary_large_image', title, images: [og] },
  }
}

export default async function BadgePage({ params }: { params: { id: string } }) {
  const { data: b, error } = await supabaseAnon
    .from('badges')
    .select('id,owner_handle,title,progress,target,image_key,url,created_at')
    .eq('id', params.id)
    .eq('public', true)
    .single()

  if (error) return <pre>Erreur: {error.message}</pre>
  if (!b) return <main className="p-6">Badge introuvable</main>

  let imageUrl = (b as any).url as string | null
  if (!imageUrl && (b as any).image_key) {
    const { data } = supabaseAnon.storage.from('badges').getPublicUrl((b as any).image_key)
    imageUrl = data.publicUrl
  }

  return (
    <main className="p-6">
      <a href={`/u/${b.owner_handle}`} className="underline">@{b.owner_handle}</a>
      <h1 className="text-3xl font-semibold mt-2">{b.title}</h1>
      <p className="mt-2">Progress: {b.progress}/{b.target}</p>
      {imageUrl && <img src={imageUrl} alt={b.title} className="mt-4 max-w-lg rounded" />}
    </main>
  )
}
