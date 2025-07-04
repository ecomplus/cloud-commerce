#!/usr/bin/env zx
/* eslint-disable no-console, no-await-in-loop, import/no-extraneous-dependencies */
import {
  $,
  fs,
  cd,
  within,
  globby,
  argv,
  retry,
  spinner,
  syncProcessCwd,
} from 'zx';

$.verbose = true;
syncProcessCwd();

const listFolders = async (parentPath) => {
  return (await fs.readdir(parentPath, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && d.name.charAt(0) !== '.')
    .map((dirent) => dirent.name);
};

$.quiet = true;
const pwd = (await $`pwd`).stdout.trim();
$.quiet = false;
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
      fs.readdirSync(`${pwd}/ecomplus-stores`)
        .forEach((store) => {
          if (store.startsWith('.')) return;
          const storeDir = `${pwd}/ecomplus-stores/${store}`;
          if (!storesDirs.includes(storeDir) && fs.statSync(storeDir).isDirectory()) {
            storesDirs.push(storeDir);
          }
        });
    }
    for (let i = 0; i < storesDirs.length; i += 2) {
      const batch = storesDirs.slice(i, i + 2);
      await Promise.all(batch.map((storeDir) => within(async () => {
        $.cwd = storeDir;
        await $`git pull`;
        for (let iii = 0; iii < functions.length; iii++) {
          const codebase = functions[iii];
          $.cwd = `${storeDir}/functions/${codebase}`;
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
        $.cwd = storeDir;
        await $`rm -rf node_modules package-lock.json`;
        await $`npm i --save @cloudcommerce/cli@${version}`;
        await $`npm i --save-dev @cloudcommerce/eslint@${version}`;
        await $`rm -rf node_modules`;
        try {
          await $`git add package* functions/*/package*`;
          await $`git commit -m 'Update to v${version}' \
            -m 'https://github.com/ecomplus/cloud-commerce/releases/tag/v${version}'`;
          await $`git push`;
        } catch {
          //
        }
      })));
    }
    return cd(pwd);
  });
  await $`pnpm fix-install`;
  await $`git add packages/*/package.json packages/*/*/package.json pnpm-lock.yaml`;
  for (let i = 0; i < storesDirs.length; i++) {
    await $`git add ${storesDirs[i].replace(`${pwd}/`, '')}`;
  }
  await $`git commit -m 'chore: Fix package versions and submodules post-release'`;
  await $`git push --follow-tags origin main`;
}
