#!/bin/bash

pnpm build --filter='@cloudcommerce/*' || exit 1
pnpm test || exit 1
pnpm run -r prerelease
npx standard-version --commit-all || exit 1
npx zx scripts/release.mjs --publish
