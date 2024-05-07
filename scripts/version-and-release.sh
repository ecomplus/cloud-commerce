#!/bin/bash

pnpm build --filter='@cloudcommerce/*' || exit 1
pnpm test || exit 1
pnpm run -r prerelease
sleep 5
rm -f .git/index.lock
npx standard-version
sleep 1
(git add packages/**/package.json package.json pnpm-lock.yaml CHANGELOG.md \
  && git commit -m 'chore: Fixing package versions post-release') || true
npx zx scripts/release.mjs --publish
