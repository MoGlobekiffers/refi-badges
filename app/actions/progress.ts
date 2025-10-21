"use server";

export async function incrementAndMaybeGenerate({
  habit, user, currentCount, target,
}: { habit: string; user: string; currentCount: number; target: number }) {

  const newCount = currentCount + 1;

  // TODO: ici, update ta DB avec newCount

  let badgeUrl: string | null = null;
  if (newCount >= target) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/badge/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit, user, count: newCount, target }),
      cache: "no-store",
    });
    const json = await res.json();
    if (json.ok) badgeUrl = json.url;
  }

  return { newCount, badgeUrl };
}
