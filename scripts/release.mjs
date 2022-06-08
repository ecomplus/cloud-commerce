#!/usr/bin/env zx
/* eslint-disable no-console, no-await-in-loop */
/* global $, fs, globby, argv */

// await $`npx standard-version`;
const pwd = (await $`pwd`).stdout.trim();
const { version } = JSON.parse(fs.readFileSync('package.json'));
const packages = await globby(['packages/**/package.json', '!**/node_modules']);

for (let i = 0; i < packages.length; i++) {
  const pkgPath = packages[i];
  const pkg = JSON.parse(fs.readFileSync(pkgPath));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  if (argv.publish) {
    await $`cd ${pkgPath.replace('/package.json', '')} && npm publish --access public`;
    await $`cd ${pwd}`;
  }
}
