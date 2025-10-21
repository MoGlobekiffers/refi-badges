"use client";
import { useState } from "react";

type Props = {
  habit: string;   // ex: "walk 30 min"
  user: string;    // ex: "Mo"
  target: number;  // ex: 7
};

export default function TriggerBadge({ habit, user, target }: Props) {
  const [count, setCount] = useState(0);
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onIncrement() {
    const newCount = count + 1;
    setCount(newCount);

    if (newCount >= target && !badgeUrl) {
      try {
        setLoading(true);
        const res = await fetch("/api/badge/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habit, user, count: newCount, target }),
        });
        const json = await res.json();
        if (json.ok) {
          setBadgeUrl(json.url);
        } else {
          console.error("badge/generate error:", json);
          alert("Erreur génération badge: " + (json.error ?? "inconnue"));
        }
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 18, marginBottom: 8 }}>
        Progress: {count}/{target}
      </div>
      <button
        onClick={onIncrement}
        disabled={loading}
        style={{ padding: "8px 12px", borderRadius: 8, background: "black", color: "white" }}
      >
        {loading ? "Génération..." : "Incrémenter"}
      </button>

      {badgeUrl && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Badge généré :</div>
          <img src={badgeUrl} alt="Badge atteint" style={{ maxWidth: "100%", height: "auto", borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}
