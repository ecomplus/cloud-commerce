#!/usr/bin/env zx
/* eslint-disable no-console, no-await-in-loop, import/no-unresolved */
/* global $, fs, globby, argv */
import { retry, spinner } from 'zx/experimental';

// await $`npx standard-version`;
const { version } = JSON.parse(fs.readFileSync('package.json'));
const packages = await globby(['packages/**/package.json', '!**/node_modules']);

for (let i = 0; i < packages.length; i++) {
  const pkgPath = packages[i];
  const pkg = JSON.parse(fs.readFileSync(pkgPath));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  if (argv.publish) {
    await $`pnpm publish -r --access public --no-git-checks`;
    await $`cd store/functions`;
    await retry(10, '1s', async () => {
      const firebasePkg = `@cloudcommerce/firebase@${version}`;
      await spinner('give npm registry a time...', () => $`sleep 5`);
      await $`npm i --save ${firebasePkg} && npm update`;
      await $`git pull && git add package* && git commit -m 'Update to \`${firebasePkg}\`'`;
      await $`git push`;
      await $`cd ../.. && git submodule update --remote --merge`;
      await $`git add store && git commit -m 'chore: Update store submodule post-release'`;
      return $`git push --follow-tags origin main`;
    });
  }
}
