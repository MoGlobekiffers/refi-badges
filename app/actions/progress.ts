"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function toggleDayServer(dateIso: string, weekStartIso: string) {
    try {
        const supabase = await createClient();

        // 1. Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Unauthorized");

        // 2. Get Profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("id, target, habit")
            .eq("id", user.id)
            .single();

        if (!profile) throw new Error("Profile not found");

        // 2.5 Strict Mode
        const todayIso = new Date().toISOString().slice(0, 10);
        if (dateIso !== todayIso && process.env.NODE_ENV !== "development") {
            // allowing dev for testing
            throw new Error("Strict Mode: You can only log progress for the current day.");
        }

        // 3. Collision Logic (One Habit Per Day) - ROBUST RANGE CHECK
        // We must check the entire day to catch rows with times (e.g. 12:00)
        const startOfDay = new Date(dateIso + "T00:00:00.000Z").toISOString();
        const endOfDay = new Date(dateIso + "T23:59:59.999Z").toISOString();

        const { data: existing } = await supabase
            .from("progress")
            .select("id, habit, achieved_at")
            .eq("profile_id", profile.id)
            .gte("achieved_at", startOfDay)
            .lt("achieved_at", endOfDay)
            .maybeSingle(); // Use maybeSingle to avoid 406 error if multiple rows exist (though constraint prevents this)

        let action = "none";

        if (existing) {
            if (existing.habit === profile.habit) {
                // Same habit? Toggle OFF (Delete)
                const { error: delError } = await supabase.from("progress").delete().eq("id", existing.id);
                if (delError) throw new Error("Toggle OFF failed: " + delError.message);
                action = "removed";
            } else {
                // Different habit? UPDATE the record (Safest way to handle Unique Constraint)
                const { error: upError } = await supabase
                    .from("progress")
                    .update({ habit: profile.habit, week_start: weekStartIso })
                    .eq("id", existing.id);

                if (upError) throw new Error("Habit switch update failed: " + upError.message);
                action = "updated";
            }
        } else {
            // New Entry? INSERT
            // Note: We use the exact 'dateIso' from client, assuming 00:00:00 or similar consistent time
            const { error: insError } = await supabase.from("progress").insert({
                profile_id: profile.id,
                achieved_at: dateIso,
                habit: profile.habit,
                week_start: weekStartIso
            });

            // Handle race condition where row was created between select and insert
            if (insError) {
                if (insError.code === '23505') { // Unique violation
                    // Fallback: This means it exists now. Try updating it.
                    const { error: retryError } = await supabase
                        .from("progress")
                        .update({ habit: profile.habit, week_start: weekStartIso })
                        .eq("profile_id", profile.id)
                        .eq("achieved_at", dateIso); // Use dateIso as key

                    if (retryError) throw new Error("Retry update failed: " + retryError.message);
                    action = "updated";
                } else {
                    throw new Error("Insert failed: " + insError.message);
                }
            } else {
                action = "added";
            }
        }

        // 4. Check for Badge (Using Client's Week Boundaries)
        const monday = new Date(weekStartIso);
        const nextMonday = new Date(monday);
        nextMonday.setUTCDate(monday.getUTCDate() + 7);

        const { count } = await supabase
            .from("progress")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", profile.id)
            .eq("habit", profile.habit)
            .gte("achieved_at", monday.toISOString())
            .lt("achieved_at", nextMonday.toISOString());

        const currentCount = count || 0;

        revalidatePath("/app");
        return { success: true, action, currentCount, eligible: currentCount >= (profile.target || 1) };
    } catch (e: any) {
        console.error("Toggle Failed", e);
        return { success: false, error: e.message };
    }
}

export async function claimBadgeServer(weekStartIso: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase
            .from("profiles")
            .select("id, handle, habit, target")
            .eq("id", user.id)
            .single();

        if (!profile) throw new Error("Profile not found");

        const monday = new Date(weekStartIso);
        const nextMonday = new Date(monday);
        nextMonday.setUTCDate(monday.getUTCDate() + 7);

        // 1. Verify Count
        const { count } = await supabase
            .from("progress")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", profile.id)
            .eq("habit", profile.habit)
            .gte("achieved_at", monday.toISOString())
            .lt("achieved_at", nextMonday.toISOString());

        const currentCount = count || 0;
        const target = profile.target || 1;

        if (currentCount < target) {
            throw new Error(`Target not met. Found ${currentCount}/${target} for habit ${profile.habit}`);
        }

        // 2. Check Existence
        const { data: existingBadge } = await supabase
            .from("badges")
            .select("image_url")
            .eq("profile_id", profile.id)
            .eq("habit", profile.habit)
            .gte("created_at", monday.toISOString())
            .lt("created_at", nextMonday.toISOString())
            .single();

        if (existingBadge) return { success: true, badgeUrl: existingBadge.image_url, isNew: false };

        // 3. Generate
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/badge/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                habit: profile.habit,
                user: profile.handle || "Explorer",
                count: currentCount,
                target: target,
                profileId: profile.id
            }),
        });

        const json = await res.json();
        if (!json.ok) throw new Error("Generator failed");

        revalidatePath("/app");
        return { success: true, badgeUrl: json.url, isNew: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function resetWeekServer(weekStartIso: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // Fetch profile to guarantee ID match
        const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
        if (!profile) throw new Error("Profile not found");

        const monday = new Date(weekStartIso);
        const nextMonday = new Date(monday);
        nextMonday.setUTCDate(monday.getUTCDate() + 7);

        console.log(`[Reset] Resetting week for profile ${profile.id}: ${monday.toISOString()} -> ${nextMonday.toISOString()}`);

        const { error, count } = await supabase
            .from("progress")
            .delete({ count: 'exact' })
            .eq("profile_id", profile.id) // Use profile.id!
            .gte("achieved_at", monday.toISOString())
            .lt("achieved_at", nextMonday.toISOString());

        if (error) throw error;

        revalidatePath("/app");
        return { success: true, count };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}



export async function hardResetServer() {
    try {
        // Authenticate user to get ID, but use Admin for deletion
        const supabase = await createClient();
        const { data: { user } = {} } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
        if (!profile) throw new Error("Profile not found");

        console.log(`[HardReset] ADMIN Deleting ALL progress for profile ${profile.id}`);

        const adminSb = createSupabaseAdmin();

        const { error, count } = await adminSb
            .from("progress")
            .delete({ count: 'exact' })
            .eq("profile_id", profile.id);

        if (error) throw error;

        console.log(`[HardReset] Admin Deleted ${count} rows`);
        revalidatePath("/app");
        return { success: true, count };
    } catch (e: any) {
        console.error("Hard Reset Failed", e);
        return { success: false, error: e.message };
    }
}

export async function getDebugProgress() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return ["No User"];

        const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
        if (!profile) return ["No Profile"];

        const { data } = await supabase
            .from("progress")
            .select("*")
            .eq("profile_id", profile.id) // Use profile.id!
            .order('achieved_at', { ascending: false });

        // Return diagnostic info
        return {
            userId: user.id,
            profileId: profile.id,
            rows: data || []
        };
    } catch (e: any) {
        console.error(e);
        return { error: e.message };
    }
}
