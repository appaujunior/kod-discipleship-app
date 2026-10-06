#!/bin/zsh
# Stores the Supabase service-role key locally and on Vercel, then checks it works.
# The key is never echoed to the screen and never written to your shell history.
#
#   zsh scripts/set-service-key.sh
#
# Get the key from: Supabase -> Project Settings -> API Keys -> service_role (Reveal)

set -e
cd "${0:a:h}/.."

if [ ! -f .env.local ]; then
  echo "No .env.local here. Run this from the project folder." >&2
  exit 1
fi

PROJECT_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2-)

printf 'Paste your Supabase service_role key, then press Enter.\n'
printf 'It will not appear on screen.\n> '
stty -echo
read -r KEY
stty echo
printf '\n'

if [ -z "$KEY" ]; then
  echo "Nothing pasted. Stopping without changing anything." >&2
  exit 1
fi

echo "Checking the key against Supabase..."
STATUS=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$PROJECT_URL/auth/v1/admin/users?per_page=1")

if [ "$STATUS" != "200" ]; then
  echo "That key was rejected (HTTP $STATUS). Nothing was saved." >&2
  echo "Make sure you copied service_role, not anon, and that you got the whole thing." >&2
  exit 1
fi
echo "Key works."

# Save locally, replacing any previous value.
grep -v '^SUPABASE_SERVICE_ROLE_KEY=' .env.local > .env.local.new || true
printf 'SUPABASE_SERVICE_ROLE_KEY=%s\n' "$KEY" >> .env.local.new
mv .env.local.new .env.local
echo "Saved to .env.local"

# Save on Vercel, replacing any previous value.
echo "Saving to Vercel..."
pnpm dlx vercel@latest env rm SUPABASE_SERVICE_ROLE_KEY production --yes > /dev/null 2>&1 || true
printf '%s' "$KEY" | pnpm dlx vercel@latest env add SUPABASE_SERVICE_ROLE_KEY production --type secret > /dev/null 2>&1

if pnpm dlx vercel@latest env ls 2>/dev/null | grep -q SUPABASE_SERVICE_ROLE_KEY; then
  echo "Saved to Vercel."
  echo
  echo "Done. Next: switch off 'Allow new users to sign up' in Supabase, then redeploy."
else
  echo "Vercel did not accept it. Add it by hand at:" >&2
  echo "  Vercel → your project → Settings → Environment Variables" >&2
  exit 1
fi
