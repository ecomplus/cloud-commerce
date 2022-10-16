#!/usr/bin/env zx
/* eslint-disable no-console, no-await-in-loop, import/no-unresolved */
/* global $, quiet, fs, cd, globby, argv */
import { retry, spinner } from 'zx/experimental';

const listFolders = async (parentPath) => {
  return (await fs.readdir(parentPath, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && d.name.charAt(0) !== '.')
    .map((dirent) => dirent.name);
};

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
    const functions = await listFolders(`${pwd}/store/functions`);
    const storesDirs = [
      `${pwd}/store`,
      ...(await listFolders(`${pwd}/ecomplus-stores`))
        .map((store) => `${pwd}/ecomplus-stores/${store}`),
    ];
    const {
      dependencies: ssrDependencies,
    } = JSON.parse(fs.readFileSync(`${pwd}/packages/ssr/package.json`));
    const astroPkgs = Object.keys(ssrDependencies)
      .filter((dep) => dep.startsWith('@astrojs/'));
    for (let ii = 0; ii < storesDirs.length; ii++) {
      const storeDir = storesDirs[ii];
      for (let iii = 0; iii < functions.length; iii++) {
        const codebase = functions[iii];
        cd(`${storeDir}/functions/${codebase}`);
        await $`rm -rf node_modules package-lock.json`;
        await $`npm i --save @cloudcommerce/firebase@${version}`;
        if (codebase !== 'core') {
          await $`npm i --save @cloudcommerce/${codebase}@${version}`;
          if (codebase === 'ssr') {
            await $`npm i --save @cloudcommerce/api@${version}`;
            await $`npm i --save-dev @cloudcommerce/storefront@${version}`;
            for (let i = 0; i < astroPkgs.length; i++) {
              const dep = astroPkgs[i];
              await $`npm i --save '${dep}@^${ssrDependencies[dep]}'`;
            }
          }
        }
        await $`rm -rf node_modules`;
      }
      cd(storeDir);
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
    }
    return cd(pwd);
  });
  await $`pnpm i`;
  await $`git add pnpm-lock.yaml store ecomplus-stores`;
  await $`git commit -m 'chore: Update store submodule post-release'`;
  await $`git push --follow-tags origin main`;
}
