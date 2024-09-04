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

css_files=($(ls ./dist/client/_astro/*.css))
html_files=($(find ./dist/client/ -name "*.html"))
for css_file in "${css_files[@]}"; do
  css_base=$(basename "$css_file" | cut -d'.' -f1)
  new_css_hash=$(basename "$css_file")
  for html_file in "${html_files[@]}"; do
    if [[ -n "$new_css_hash" ]]; then
      sed -i -E "s|${css_base}\.[^.]*\.css|${new_css_hash}|g" "$html_file"
    fi
  done
done

process_images() {
  local dir="$1"
  local prefix="$2"
  local output_file="$3"
  local append_flag="$4"

  find "$dir" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.webp" -o -iname "*.avif" -o -iname "*.svg" \) -print0 | 
  while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    dimensions=$(identify -format "%wx%h" "$file" 2>/dev/null)
    if [ -n "$dimensions" ]; then
      width=$(echo $dimensions | cut -d'x' -f1)
      height=$(echo $dimensions | cut -d'x' -f2)
      printf '"%s%s",%s,%s\n' "$prefix" "${filename//\"/\"\"}" "$width" "$height" >> "$output_file"
    fi
  done
}

process_images "./dist/client/_astro" "" "./dist/server/images.dist.csv" ""
process_images "./public/assets" "assets/" "./dist/server/images.src.csv" ""
process_images "./public/img" "img/" "./dist/server/images.src.csv" ">>"
process_images "./public/img/uploads" "img/uploads/" "./dist/server/images.src.csv" ">>"

static_builds_file="./dist/server/static-builds.csv"
> "$static_builds_file"
find ./dist/client/_astro -type f -print0 | while IFS= read -r -d '' file; do
  relative_path="${file#./dist/client}"
  escaped_path="${relative_path//\"/\"\"}"
  printf '"%s"\n' "$escaped_path" >> "$static_builds_file"
done

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
