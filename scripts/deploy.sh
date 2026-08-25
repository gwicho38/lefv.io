#!/usr/bin/env bash
# Emergency deploy. The normal path is pushing to main; this exists for when
# CI is unavailable, and enforces the same invariant: only the tip of main ships.
set -euo pipefail

if [ -n "$(git status --porcelain)" ]; then
  echo "Refusing to deploy: working tree is dirty." >&2
  exit 1
fi

git fetch origin main --quiet
head=$(git rev-parse HEAD)
tip=$(git rev-parse origin/main)

if [ "$head" != "$tip" ]; then
  echo "Refusing to deploy $head; tip of main is $tip." >&2
  echo "Check out main and pull before deploying." >&2
  exit 1
fi

echo "Deploying tip of main: $head"
npm run build
npx wrangler deploy
