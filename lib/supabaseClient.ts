import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client navigateur (publique) : auth / onboarding côté client
export const supabase = createClient(url, anon);

// ✅ export par défaut + nommé (les deux fonctionnent)
export default supabase;
