'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const redirectTo = `${location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })
      if (error) throw error
      setMsg('✅ Lien de connexion envoyé. Vérifie ta boîte mail.')
    } catch (err: any) {
      setMsg(`❌ ${err.message ?? 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Connexion</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded px-3 py-2"
        >
          {loading ? 'Envoi…' : 'Recevoir le lien'}
        </button>
      </form>
      {msg && <p className="mt-4">{msg}</p>}
    </main>
  )
}
