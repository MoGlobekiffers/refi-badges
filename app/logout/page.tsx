'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function Logout() {
  const router = useRouter()
  useEffect(() => {
    (async () => {
      await supabase.auth.signOut()
      router.replace('/login')
    })()
  }, [router])
  return <main className="max-w-md mx-auto p-6">Déconnexion…</main>
}
