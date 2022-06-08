#!/usr/bin/env zx
/* global $, fs, globby, argv */

// await $`npx standard-version`;
const { version } = JSON.parse(fs.readFileSync('package.json'));
const packages = await globby(['packages/**/package.json', '!**/node_modules']);

packages.forEach(async (pkgPath) => {
  const pkg = JSON.parse(fs.readFileSync(pkgPath));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  if (argv.publish) {
    const { stdout } = await $`pwd`;
    await $`cd ${pkgPath.replace('/package.json', '')} && npm publish --access public`;
    await $`cd ${stdout}`;
  }
});
