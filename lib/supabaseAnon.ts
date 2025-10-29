import { createClient } from '@supabase/supabase-js';

// Client anonyme utilisable côté serveur/edge
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
  }
);

// On fournit aussi un export par défaut, au cas où.
export default supabase;
