// utils/week.ts
export function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10) // yyyy-mm-dd
}

export function startOfISOWeek(d: Date) {
  // Lundi = 1 … Dimanche = 7
  const day = d.getDay(); // 0..6 (0 = dimanche)
  const diffFromMonday = (day + 6) % 7; // 0 si lundi
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - diffFromMonday);
  return x;
}

export function getWeekDates(weekStart: Date) {
  const a: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    a.push(d);
  }
  return a;
}

export function daysBetween(a: Date, b: Date) {
  const A = new Date(a); A.setHours(0,0,0,0);
  const B = new Date(b); B.setHours(0,0,0,0);
  return Math.round((B.getTime() - A.getTime()) / 86400000);
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

