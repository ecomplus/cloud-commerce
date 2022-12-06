#!/bin/bash

pnpm build --force || exit 1
pnpm test || exit 1
git add packages/**/auto-*.d.ts packages/**/.*-auto-* packages/storefront/components.d.ts
pnpm run -r prerelease
npx standard-version --commit-all
npx zx scripts/release.mjs --publish --skip-stores
