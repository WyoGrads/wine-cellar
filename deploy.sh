#!/usr/bin/env bash
# Deploy wine.wyograds.com to Cloudflare Pages
# Usage:  CLOUDFLARE_API_TOKEN=<token> ./deploy.sh
# Token:  https://dash.cloudflare.com/profile/api-tokens
#         Required permissions: Cloudflare Pages — Edit

set -euo pipefail

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "ERROR: set CLOUDFLARE_API_TOKEN before running this script."
  echo "  Get one at: https://dash.cloudflare.com/profile/api-tokens"
  echo "  Permissions needed: Cloudflare Pages — Edit"
  exit 1
fi

export CLOUDFLARE_API_TOKEN

PROJECT="wine-cellar"
DOMAIN="wine.wyograds.com"
DIR="$(cd "$(dirname "$0")" && pwd)/dashboard"

echo "==> Deploying $DIR to Cloudflare Pages project: $PROJECT"
npx --yes wrangler@latest pages deploy "$DIR" \
  --project-name "$PROJECT" \
  --branch main

echo ""
echo "==> Deployment complete."
echo "    Dashboard: https://$PROJECT.pages.dev"
echo ""
echo "==> To point $DOMAIN at this deployment:"
echo "    1. Go to https://dash.cloudflare.com"
echo "    2. Pages → $PROJECT → Custom domains → Add"
echo "    3. Enter: $DOMAIN"
echo "    (CNAME record is auto-created since domain is already on Cloudflare)"
