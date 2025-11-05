"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function getServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

type FinishWeekParams = {
  profileId: string;
  habit: string;
  target: number;
  weekStartISO: string; // "YYYY-MM-DD" du lundi de la semaine courante
};

/**
 * Crée un badge puis supprime toutes les réalisations de la semaine
 * pour ce profile. Appelée depuis la page /app.
 */
export async function finishWeek({
  profileId,
  habit,
  target,
  weekStartISO,
}: FinishWeekParams) {
  const supabase = getServerClient();

  // 1) Créer le badge
  const { error: badgeError } = await supabase.from("badges").insert({
    profile_id: profileId,
    habit,
    target,
    achieved_at: new Date().toISOString(),
  });

  if (badgeError) {
    throw badgeError;
  }

  // 2) Supprimer toutes les réalisations de la semaine courante
  const weekStart = new Date(weekStartISO + "T00:00:00.000Z");
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const { error: deleteError } = await supabase
    .from("progress")
    .delete()
    .eq("profile_id", profileId)
    .gte("achieved_at", weekStart.toISOString())
    .lt("achieved_at", weekEnd.toISOString());

  if (deleteError) {
    throw deleteError;
  }

  return { ok: true };
}

