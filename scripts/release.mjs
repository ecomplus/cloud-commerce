#!/usr/bin/env zx
/* eslint-disable no-console, no-await-in-loop, import/no-unresolved */
/* global $, quiet, fs, cd, globby, argv */
import { spinner } from 'zx/experimental';

// await $`npx standard-version`;
const pwd = (await quiet($`pwd`)).stdout.trim();
const { version } = JSON.parse(fs.readFileSync('package.json'));
const packages = await globby(['packages/**/package.json', '!**/node_modules']);

for (let i = 0; i < packages.length; i++) {
  const pkgPath = packages[i];
  if (/\/(__|\.)[^/]+\/package\.json$/.test(pkgPath)) {
    continue;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  if (argv.publish) {
    await $`pnpm publish -r --access public --no-git-checks`;
    await $`git submodule update --remote --merge`;
    cd(`${pwd}/store/functions`);
    await spinner('give npm registry a time...', () => $`sleep 30`);
    await $`rm -rf node_modules package-lock.json`;
    await $`npm i --save @cloudcommerce/firebase@${version}`;
    cd(`${pwd}/store`);
    await $`rm -rf node_modules package-lock.json`;
    await $`npm i --save @cloudcommerce/cli@${version}`;
    await $`git add package* functions/package*`;
    await $`git commit -m 'Update to v${version}' \
      -m 'https://github.com/ecomplus/cloud-commerce/releases/tag/v${version}'`;
    await $`git push`;
    cd(pwd);
    await $`pnpm i`;
    await $`git add store && git commit -m 'chore: Update store submodule post-release'`;
    await $`git push --follow-tags origin main`;
  }
}
