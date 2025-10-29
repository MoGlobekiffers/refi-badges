import { ImageResponse } from 'next/og'
import { supabaseAnon } from '@/lib/supabaseAnon'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG({ params }: { params: { id: string } }) {
  const { data: b } = await supabaseAnon
    .from('badges')
    .select('title,progress,target')
    .eq('id', params.id)
    .eq('public', true)
    .single()

  const title = b?.title ?? 'ReFi Badges'
  const progress = b ? `${b.progress}/${b.target}` : ''

  return new ImageResponse(
    <div style={{
      width: '1200px', height: '630px', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      background: '#0b1220', color: '#fff', fontSize: 64, gap: 20
    }}>
      <div>{title}</div>
      {progress && <div style={{ fontSize: 48, opacity: .9 }}>{progress}</div>}
    </div>,
    size
  )
}
