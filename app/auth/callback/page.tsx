"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Supporte 2 retours:
 * 1) PKCE:   /auth/callback?code=... (&state=...)  -> exchangeCodeForSession()
 * 2) Implicit / hash: /auth/callback#access_token=...&refresh_token=... -> setSession()
 */
export default function Callback() {
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    async function run() {
      try {
        const href = window.location.href;
        const url = new URL(href);
        const hasCode = url.searchParams.get("code");
        const hash = window.location.hash || "";
        const hasAccessToken = hash.includes("access_token=");

        if (hasCode) {
          // Flow PKCE
          const { error } = await supabase.auth.exchangeCodeForSession(href);
          if (error) throw error;
        } else if (hasAccessToken) {
          // Flow implicite (hash)
          const hashParams = new URLSearchParams(hash.slice(1)); // enlève le '#'
          const access_token = hashParams.get("access_token");
          const refresh_token = hashParams.get("refresh_token");

          if (!access_token || !refresh_token) {
            throw new Error("Missing tokens in URL hash.");
          }

          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
        } else {
          throw new Error("No auth params found in URL.");
        }

        // Nettoie l’URL et redirige
        window.history.replaceState({}, "", "/app");
        setMsg("Signed in! Redirecting to /app…");
        setTimeout(() => (window.location.href = "/app"), 600);
      } catch (err: any) {
        setMsg(`Auth error: ${err?.message ?? String(err)}`);
      }
    }
    run();
  }, []);

  return <main className="p-6">{msg}</main>;
}

