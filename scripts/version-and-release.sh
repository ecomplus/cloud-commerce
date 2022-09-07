#!/bin/bash

pnpm build
pnpm test
npx turbo run prerelease
npx standard-version --commit-all
npx zx scripts/release.mjs --publish
npx turbo run postrelease
