'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function AuthCallback() {
  const [msg, setMsg] = useState('Connexion en cours…')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.href).then(({ error }) => {
      if (error) {
        setMsg('❌ ' + error.message)
      } else {
        setMsg('✅ Connecté, redirection…')
        // Ajuste la destination si tu préfères /app
        router.replace('/onboarding')
      }
    })
  }, [router])

  return <main className="max-w-md mx-auto p-6">{msg}</main>
}
