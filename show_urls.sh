set -e
npx vercel env pull .env.local >/dev/null || true
SITE_URL="$(grep '^NEXT_PUBLIC_SITE_URL=' .env.local | cut -d= -f2-)"
[ -z "$SITE_URL" ] && SITE_URL="https://refi-badges.vercel.app"
SUPABASE_URL="$(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2-)"
ANON="$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2-)"

BID="$(curl -s "$SUPABASE_URL/rest/v1/badges?select=id&is_public=eq.true&order=created_at.desc&limit=1" \
  -H "apikey: $ANON" | jq -r '.[0].id // empty')"

echo "$SITE_URL/badges"
echo "$SITE_URL/u/test"
if [ -n "$BID" ]; then
  echo "$SITE_URL/badge/$BID"
else
  echo "$SITE_URL/badge/<ID>"
fi
