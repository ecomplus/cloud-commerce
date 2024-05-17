#!/bin/bash

npx zx scripts/release.mjs
git add packages/*/package.json
git add packages/*/*/package.json
