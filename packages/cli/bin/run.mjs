#!/usr/bin/env node
import { $, argv } from 'zx';

(async () => {
  const options = Object.keys(argv).reduce((opts, key) => {
    if (key !== '_') {
      // eslint-disable-next-line no-param-reassign
      opts += `--${key} ${argv[key]}\n`;
    }
    return opts;
  }, '');
  const $firebase = async (cmd) => $`npx firebase-tools ${cmd} ${options}`;
  if (argv._.includes('serve')) {
    return $firebase('emulators:start');
  }
  if (argv._.find((cmd) => /^(\w+:)?(shell|start)$/.test(cmd))) {
    return $firebase('functions:shell');
  }
  if (argv._.find((cmd) => /^(\w+:)?logs?$/.test(cmd))) {
    return $firebase('functions:log');
  }
  if (argv._.includes('deploy')) {
    return $firebase('deploy');
  }
  return $`echo 'Hello from @cloudcommerce/cli'`;
})();
