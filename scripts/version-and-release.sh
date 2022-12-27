#!/bin/bash

pnpm build --force || exit 1
pnpm test || exit 1
pnpm run -r prerelease
npx standard-version --commit-all
npx zx scripts/release.mjs --publish
