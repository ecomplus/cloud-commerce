/* global $ */

await $`tsc -p ../../tsconfig.test.json`;
await $`tsx tests/index.test.ts`;
