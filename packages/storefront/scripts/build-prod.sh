#!/bin/bash

BUILD_OUTPUT=static \
BUILD_MINIMAL=true \
BUILD_OUT_DIR=./.cloudcommerce/sf-tmp-dist \
  npx astro build
DEPLOY_RUNTIME=serverless npx astro build

mv ./.cloudcommerce/sf-tmp-dist/_astro/*.{png,jpg,jpeg,webp,avif,svg} \
  ./dist/client/_astro/ \
  2>/dev/null
mv ./.cloudcommerce/sf-tmp-dist/~fallback/index.html ./dist/client/~fallback.html
mv ./.cloudcommerce/sf-tmp-dist/index.html ./dist/client/~index.html
mv ./.cloudcommerce/sf-tmp-dist/app/ ./dist/client/
mv ./.cloudcommerce/sf-tmp-dist/admin/ ./dist/client/
rm -rf ./.cloudcommerce/sf-tmp-dist

new_css_hash=$(ls ./dist/client/_astro/*.css | sed -n 's/.*\/_astro\/\(_slug_[^.]*\..*\.css\)/\1/p')
if [[ -n "$new_css_hash" ]]; then
  sed -i -E "s/_slug_[^.]*\..*\.css/$new_css_hash/g" ./dist/client/~index.html
  sed -i -E "s/_slug_[^.]*\..*\.css/$new_css_hash/g" ./dist/client/~fallback.html
fi

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

ls ./dist/client/_astro/* \
  > ./dist/server/static-builds.csv \
  2>/dev/null
sed -i -e 's/.\/dist\/client//g' ./dist/server/static-builds.csv

if [[ -n $STOREFRONT_BASE_DIR ]]; then
  base_dir=$(realpath "$STOREFRONT_BASE_DIR")
else
  base_dir=$(pwd)
fi
content_dir=$(realpath "$base_dir/content")
settings_path="$content_dir/settings.json"
domain=$(grep '"domain"' $settings_path | awk -F\" '{ print $4 }')

robots_file="./dist/client/robots.txt"
if [[ -f $robots_file ]]; then
  if ! grep -q "Sitemap: " "$robots_file"; then
    echo "" >> "$robots_file"
    echo "Sitemap: https://$domain/sitemap-index.xml" >> "$robots_file"
  fi
fi

exit 0
