set -euo pipefail
npx vercel env pull .env.local >/dev/null
SITE_URL="$(grep '^NEXT_PUBLIC_SITE_URL=' .env.local | cut -d= -f2-)"
[ -z "${SITE_URL:-}" ] && SITE_URL="https://refi-badges.vercel.app"
SUPABASE_URL="$(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2-)"
SR_KEY="$(grep '^SUPABASE_SERVICE_ROLE_KEY=' .env.local | cut -d= -f2-)"
curl -s -X POST "$SUPABASE_URL/rest/v1/profiles" -H "apikey: $SR_KEY" -H "Authorization: Bearer $SR_KEY" -H "Content-Type: application/json" -d '{"handle":"test","display_name":"Test User"}' >/dev/null || true
PID="$(curl -s "$SUPABASE_URL/rest/v1/profiles?select=id&handle=eq.test&limit=1" -H "apikey: $SR_KEY" -H "Authorization: Bearer $SR_KEY" | jq -r '.[0].id')"
NEW="$(curl -s -X POST "$SUPABASE_URL/rest/v1/badges" -H "apikey: $SR_KEY" -H "Authorization: Bearer $SR_KEY" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"title\":\"Gallery Demo\",\"description\":\"{\\\"target\\\":3,\\\"progress\\\":0}\",\"owner_id\":\"$PID\",\"is_public\":true,\"image_url\":\"$SITE_URL/api/og/badge?id=demo\"}")"
BID="$(echo "$NEW" | jq -r '.[0].id // .id')"
if [ -z "$BID" ] || [ "$BID" = "null" ]; then
  BID="$(curl -s "$SUPABASE_URL/rest/v1/badges?select=id&is_public=eq.true&order=created_at.desc&limit=1" -H "apikey: $SR_KEY" -H "Authorization: Bearer $SR_KEY" | jq -r '.[0].id')"
fi
echo "$SITE_URL/badges"
echo "$SITE_URL/u/test"
echo "$SITE_URL/badge/$BID"
