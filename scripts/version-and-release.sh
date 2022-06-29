#!/bin/bash

pnpm build
pnpm test
npx standard-version --commit-all
npx zx scripts/release.mjs --publish
