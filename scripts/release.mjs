#!/usr/bin/env zx
/* eslint-disable no-console, no-await-in-loop, import/no-unresolved */
/* global $, quiet, fs, cd, globby, YAML, argv */
import { retry, spinner } from 'zx/experimental';

const listFolders = async (parentPath) => {
  return (await fs.readdir(parentPath, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && d.name.charAt(0) !== '.')
    .map((dirent) => dirent.name);
};

// await $`npx standard-version`;
const pwd = (await quiet($`pwd`)).stdout.trim();
const { version } = JSON.parse(fs.readFileSync('package.json'));
const packages = await globby([
  'packages/*/package.json',
  'packages/apps/*/package.json',
  '!**/node_modules',
]);

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
  const canUpdateStores = !argv['skip-stores'];
  const storesDirs = [`${pwd}/store`];
  await $`git submodule update --remote --merge`;
  await retry(10, '1s', async () => {
    await spinner('give npm registry a time...', () => $`sleep 9`);
    const functions = await listFolders(`${pwd}/store/functions`);
    if (canUpdateStores) {
      YAML.parse(fs.readFileSync(`${pwd}/pnpm-workspace.yaml`, 'utf8'))
        .packages.forEach((workspaceFolder) => {
          if (/ecomplus-stores\/[^/]+$/.test(workspaceFolder)) {
            const [, store] = workspaceFolder.split('/');
            const storeDir = `${pwd}/ecomplus-stores/${store}`;
            if (!storesDirs.includes(storeDir)) {
              storesDirs.push(storeDir);
            }
          }
        });
    }
    for (let ii = 0; ii < storesDirs.length; ii++) {
      const storeDir = storesDirs[ii];
      for (let iii = 0; iii < functions.length; iii++) {
        const codebase = functions[iii];
        cd(`${storeDir}/functions/${codebase}`);
        await $`rm -rf node_modules package-lock.json`;
        if (codebase === 'ssr') {
          await $`npm i --save @cloudcommerce/{firebase,ssr,api}@${version}`;
          await $`npm i --save-dev @cloudcommerce/{storefront,i18n,types}@${version}`;
        } else if (codebase === 'many') {
          await $`npm i --save @cloudcommerce/{firebase,feeds,passport}@${version}`;
        } else {
          await $`npm i --save @cloudcommerce/{firebase,modules,events}@${version}`;
        }
        await $`rm -rf node_modules`;
      }
      cd(storeDir);
      await $`rm -rf node_modules package-lock.json`;
      await $`npm i --save @cloudcommerce/cli@${version}`;
      await $`npm i --save-dev @cloudcommerce/eslint@${version}`;
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
  await $`pnpm fix-install`;
  await $`git add pnpm-lock.yaml`;
  for (let i = 0; i < storesDirs.length; i++) {
    await $`git add ${storesDirs[i].replace(`${pwd}/`, '')}`;
  }
  await $`git commit -m 'chore: Update store submodule post-release'`;
  await $`git push --follow-tags origin main`;
}
