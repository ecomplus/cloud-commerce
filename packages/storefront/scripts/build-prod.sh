#!/bin/bash

BUILD_OUTPUT=static \
BUILD_OUT_DIR=./.cloudcommerce/sf-tmp-dist \
  npx astro build
DEPLOY_RUNTIME=serverless npx astro build

mv ./.cloudcommerce/sf-tmp-dist/_astro/*.{png,jpg,jpeg,webp,avif,svg} \
  ./dist/client/_astro/ \
  2>/dev/null
rm -rf ./.cloudcommerce/sf-tmp-dist

identify -format "%f,%w,%h\n" \
  ./dist/client/_astro/*.{png,jpg,jpeg,webp,avif,svg} \
  > ./dist/server/images.dist.csv \
  2>/dev/null

identify -format "assets/%f,%w,%h\n" \
  ./public/assets/*.{png,jpg,jpeg,webp,avif,svg} \
  > ./dist/server/images.src.csv \
  2>/dev/null
identify -format "img/%f,%w,%h\n" \
  ./public/img/*.{png,jpg,jpeg,webp,avif,svg} \
  >> ./dist/server/images.src.csv \
  2>/dev/null
identify -format "img/uploads/%f,%w,%h\n" \
  ./public/img/uploads/*.{png,jpg,jpeg,webp,avif,svg} \
  >> ./dist/server/images.src.csv \
  2>/dev/null

exit 0
