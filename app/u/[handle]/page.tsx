import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function UserBadgesPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("id, habit, target").eq("handle", handle).single();
  if (!profile) return <div className="p-4 text-center">Utilisateur introuvable.</div>;

  const { data: badges } = await supabase.from("badges").select("id, created_at").eq("profile_id", profile.id).order("created_at", { ascending: false });

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-2">Badges de {handle}</h1>
      <p className="text-center mb-6">Habitude : <b>{profile.habit}</b> — Objectif : <b>{profile.target}/7</b></p>
      {badges && badges.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {badges.map((b) => (
            <div key={b.id} className="text-center">
              <img src={`/badge/${b.id}`} alt="Badge" className="w-32 h-32 mx-auto mb-1" />
              <div className="text-xs text-gray-600">{new Date(b.created_at as any).toLocaleDateString("fr-FR")}</div>
            </div>
          ))}
        </div>
      ) : (<p className="text-center text-gray-600">Aucun badge pour l’instant.</p>)}
    </div>
  );
}
