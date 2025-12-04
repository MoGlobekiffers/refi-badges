"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function toggleDayServer(dateIso: string) {
    // We use the Service Role client (no cookies needed)
    const supabase = supabaseServer();

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // 2. Get Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, handle, habit, target")
        .eq("id", user.id)
        .single();

    if (!profile) throw new Error("Profile not found");

    // 3. Check if date already exists
    const startOfDay = new Date(dateIso + "T00:00:00.000Z").toISOString();
    const endOfDay = new Date(dateIso + "T23:59:59.999Z").toISOString();

    const { data: existing } = await supabase
        .from("progress")
        .select("id")
        .eq("profile_id", profile.id)
        .gte("achieved_at", startOfDay)
        .lt("achieved_at", endOfDay)
        .single();

    let action = "none";

    if (existing) {
        // Toggle OFF
        await supabase.from("progress").delete().eq("id", existing.id);
        action = "removed";
    } else {
        // Toggle ON
        await supabase.from("progress").insert({
            profile_id: profile.id,
            achieved_at: new Date(dateIso + "T12:00:00.000Z"),
            habit: profile.habit,
            target: profile.target,
        });
        action = "added";
    }

    // 4. Check for Badge
    const d = new Date(dateIso);
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setUTCHours(0, 0, 0, 0);

    const nextMonday = new Date(monday);
    nextMonday.setUTCDate(monday.getUTCDate() + 7);

    const { count } = await supabase
        .from("progress")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profile.id)
        .gte("achieved_at", monday.toISOString())
        .lt("achieved_at", nextMonday.toISOString());

    let badgeUrl = null;
    const currentCount = count || 0;
    const target = profile.target || 7;

    if (currentCount >= target) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
        try {
            const res = await fetch(`${baseUrl}/api/badge/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    habit: profile.habit,
                    user: profile.handle || "User",
                    count: currentCount,
                    target: target,
                    profileId: profile.id
                }),
            });
            const json = await res.json();
            if (json.ok) badgeUrl = json.url;
        } catch (e) {
            console.error("Badge gen failed", e);
        }
    }

    revalidatePath("/app");
    return { action, currentCount, badgeUrl };
}
