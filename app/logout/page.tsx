'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const supabase = createClient()
  const router = useRouter()
  useEffect(() => {
    (async () => {
      await supabase.auth.signOut()
      router.replace('/login')
    })()
  }, [router])
  return <main className="max-w-md mx-auto p-6">Déconnexion…</main>
}
