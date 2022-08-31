#!/usr/bin/env zx
/* eslint-disable no-console, no-await-in-loop, import/no-unresolved */
/* global $, quiet, fs, cd, globby, argv */
import { retry, spinner } from 'zx/experimental';

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
}

if (argv.publish) {
  if (!argv['only-store']) {
    const { stdout } = await $`pnpm publish -r --access public --no-git-checks`;
    if (stdout.trim().startsWith('There are no new packages') && !argv.force) {
      await $`exit 0`;
    }
  }
  await $`git submodule update --remote --merge`;
  await retry(10, '1s', async () => {
    await spinner('give npm registry a time...', () => $`sleep 9`);
    const functions = (await fs.readdir(`${pwd}/store/functions`, { withFileTypes: true }))
      .filter((d) => d.isDirectory() && d.name.charAt(0) !== '.')
      .map((dirent) => dirent.name);
    for (let ii = 0; ii < functions.length; ii++) {
      const codebase = functions[ii];
      cd(`${pwd}/store/functions/${codebase}`);
      await $`rm -rf node_modules package-lock.json`;
      await $`npm i --save @cloudcommerce/firebase@${version}`;
      if (codebase !== 'core') {
        await $`npm i --save @cloudcommerce/${codebase}@${version}`;
      }
      await $`rm -rf node_modules`;
    }
    cd(`${pwd}/store`);
    await $`rm -rf node_modules package-lock.json`;
    await $`npm i --save @cloudcommerce/cli@${version}`;
    await $`rm -rf node_modules`;
    try {
      await $`git add package* functions/*/package*`;
      await $`git commit -m 'Update to v${version}' \
        -m 'https://github.com/ecomplus/cloud-commerce/releases/tag/v${version}'`;
      await $`git push`;
    } catch (e) {
      //
    }
    return cd(pwd);
  });
  await $`pnpm i`;
  await $`git add store pnpm-lock.yaml`;
  await $`git commit -m 'chore: Update store submodule post-release'`;
  await $`git push --follow-tags origin main`;
}
