#!/bin/bash

function hoist_astro_deps() {
  json=$(cat package.json)
  new_json=$(echo "$json" | jq 'del(.dependencies."astro") | del(.dependencies."@astrojs/node")')
  echo "$new_json" > package.json
}

rm -rf store/node_modules
rm -rf store/package-lock.json
rm -rf store/functions/*/node_modules
rm -rf store/functions/*/package-lock.json
rm -rf ecomplus-stores/*/node_modules
rm -rf ecomplus-stores/*/package-lock.json
rm -rf ecomplus-stores/*/functions/*/node_modules
rm -rf ecomplus-stores/*/functions/*/package-lock.json

cd store/functions/ssr
hoist_astro_deps
cd ../../../

for dir in ecomplus-stores/*; do
  echo $dir
  cd "$dir/functions/ssr"
  hoist_astro_deps
  cd ../../../../
done
