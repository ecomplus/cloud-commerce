/* global $ */

await $`rm -rf dist`;
await $`tsc -p ../../tsconfig.json --outDir dist --declaration`;
await $`cp -r src/types dist/`;
