#!/bin/bash

pnpm build --force
pnpm test
pnpm run -r prerelease
npx standard-version --commit-all
npx zx scripts/release.mjs --publish
