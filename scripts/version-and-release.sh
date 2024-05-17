#!/bin/bash

pnpm build --filter='@cloudcommerce/*' || exit 1
pnpm test || exit 1
pnpm run -r prerelease
sleep 5
rm -f .git/index.lock
npx commit-and-tag-version --commit-all
npx zx scripts/release.mjs --publish
