'use client';
import { useEffect, useState } from 'react';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function WeekGrid() {
  const [checks, setChecks] = useState<boolean[]>(Array(7).fill(false));

  // Charger l'état depuis localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rb_week_checks');
      if (raw) setChecks(JSON.parse(raw));
    } catch {}
  }, []);

  // Sauvegarder à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem('rb_week_checks', JSON.stringify(checks));
    } catch {}
  }, [checks]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">This week</h2>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((d, i) => (
          <button
            key={d}
            onClick={() =>
              setChecks(prev => {
                const next = [...prev];
                next[i] = !next[i];
                return next;
              })
            }
            className={`h-16 rounded-lg border text-sm
              ${checks[i] ? 'bg-green-500/80 text-white' : 'bg-white'}`}
            aria-pressed={checks[i]}
            title={d}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="mt-4">Progress: {checks.filter(Boolean).length}/7</p>
    </div>
  );
}

