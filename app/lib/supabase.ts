import { createServerClient } from "@supabase/ssr";
export const createSupabaseServer = (cookies: {
  get(name: string): { value: string } | undefined;
  set: (name: string, value: string, opts: any) => void;
  delete: (name: string, opts: any) => void;
}) =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
