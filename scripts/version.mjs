#!/usr/bin/env zx
/* global fs, globby */

// await $`npx standard-version`;
const { version } = JSON.parse(fs.readFileSync('package.json'));
const packages = await globby(['packages/**/package.json', '!**/node_modules']);

packages.forEach(async (packagePath) => {
  const pkg = JSON.parse(fs.readFileSync(packagePath));
  pkg.version = version;
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
});
