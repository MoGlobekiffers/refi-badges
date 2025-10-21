import { createClient } from '@supabase/supabase-js'

// Client utilisable côté serveur/edge (pas de session persistée ici)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false }
  }
)
