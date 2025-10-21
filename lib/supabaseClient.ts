import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client navigateur (public, pour l'onboarding/auth côté client)
export const supabase = createClient(url, anon);

// pour compat: default + named
export default supabase;
