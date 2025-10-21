# refi-badges

Génération de badges PNG côté serveur (Next.js 15 + \`next/og\`) et stockage public sur Supabase Storage.

## Endpoints

### Aperçu OG (GET)
\`\`\`
/api/badge/og?habit=<texte>&count=<int>&target=<int>&user=<texte>
\`\`\`
- Rend une image 1200x630 avec la barre de progression.
- Mis en cache 60s (revalidate).

### Génération + Upload (POST)
\`\`\`json
POST /api/badge/generate
Content-Type: application/json
{
  "habit": "walk 30 min",
  "user": "Mo",
  "count": 7,
  "target": 7
}
\`\`\`
- Si \`count >= target\`, crée un PNG et l'upload dans le bucket \`badges\`.
- Retourne \`{ ok: true, url, path }\`.

## Variables d’environnement (Vercel)
- \`NEXT_PUBLIC_SUPABASE_URL\` = https://<id>.supabase.co
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` = clé anon (pour le client navigateur si besoin)
- \`SUPABASE_SERVICE_ROLE_KEY\` = service_role **(serveur uniquement)**
- \`SUPABASE_BUCKET\` = \`badges\`
- (optionnel) \`NEXT_PUBLIC_BASE_URL\` = URL du site (prod)

## Tests rapides

### GET (aperçu)
\`\`\`
/api/badge/og?habit=walk%2030%20min&count=5&target=7&user=Mo
\`\`\`

### POST (génération)
\`\`\`bash
curl -s -X POST https://<app-url>/api/badge/generate \
  -H "Content-Type: application/json" \
  -d '{"habit":"walk 30 min","user":"Mo","count":7,"target":7}'
\`\`\`

## Détails techniques
- \`app/api/badge/og/route.tsx\` : rendu OG + \`revalidate=60\`
- \`app/api/badge/generate/route.tsx\` : génération PNG + upload Supabase (+ rate-limit simple)
- \`lib/supabaseServer.ts\` : client serveur (Service Role)
- \`lib/supabaseClient.ts\` : client navigateur (anon)
- \`lib/slugify.ts\` : utilitaire pour construire les chemins de fichiers

