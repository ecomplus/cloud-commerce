import { WebContainer } from '@webcontainer/api';
import { json as frozenSsrPkgJson, lock as frozenSsrPkgLock } from './ssr-package';

export const genContainerFiles = ({ repo, ghToken, repoDir }: {
  repo: string,
  ghToken?: string,
  repoDir: string,
}) => ({
  'git.js': {
    file: {
      contents: `
import fs from 'node:fs';
import { join as joinPath } from 'node:path';
import { clone, pull } from 'isomorphic-git';
import * as http from 'isomorphic-git/http/node/index.cjs';
const dir = joinPath(process.cwd(), '${repoDir}');
const isClone = process.argv.find((val) => val === '--clone');
const options = {
  fs,
  http,
  dir,
  singleBranch: true,
};
${(ghToken
    ? `
options.oauth2format = 'github';
options.token = '${ghToken}';`
    : '')}
if (isClone) {
  options.url = 'https://github.com/${repo}.git';
  options.depth = 1;
  clone(options);
} else {
  pull(options);
}
`,
    },
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "git-app",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "description": "",
  "author": "",
  "license": "ISC",
  "scripts": {
    "git:clone": "node git.js --clone",
    "git:pull": "node git.js --pull"
  },
  "dependencies": {
    "isomorphic-git": "^1.25.3"
  }
}`,
    },
  },
});

export const initWebcontainer = async ({ repo, ghToken, cliTextarea }: {
  repo: string,
  ghToken?: string,
  cliTextarea: HTMLTextAreaElement,
}) => {
  const webcontainerInstance = await WebContainer.boot();
  const repoDir = 'store';
  const files = genContainerFiles({ repo, ghToken, repoDir });
  await webcontainerInstance.mount(files);
  const exec = async (command: string, args: string[]) => {
    const cliArgs = args.reduce((acc, opt) => `${acc} ${opt}`, '');
    const cli = `$ ${command}${cliArgs}\n`;
    cliTextarea.value += cli;
    const proc = await webcontainerInstance.spawn(command, args);
    if (import.meta.env.DEV || (window as any).DEBUG) {
      proc.output.pipeTo(new WritableStream({
        write(stdout) {
          console.debug?.('webcontainer', { stdout });
        },
      }));
    }
    if (await proc.exit !== 0) {
      throw new Error(`${command} failed`);
    }
  };
  await exec('npm', ['install']);
  await exec('npm', ['run', 'git:clone']);
  await exec('npm', ['--prefix', repoDir, 'ci']);
  const ssrDir = `${repoDir}/functions/ssr`;
  webcontainerInstance.fs.writeFile(`${ssrDir}/package.json`, frozenSsrPkgJson);
  webcontainerInstance.fs.writeFile(`${ssrDir}/package-lock.json`, frozenSsrPkgLock);
  await exec('npm', ['--prefix', ssrDir, 'ci']);
  await webcontainerInstance.fs.writeFile(
    `${ssrDir}/.env`,
    `ECOM_STORE_ID=${window.ECOM_STORE_ID}\n`,
  );
  const startDevServer = async () => {
    await exec('npm', ['--prefix', repoDir, 'run', 'dev']);
    // Keep restarting dev server (can crash)
    // startDevServer();
  };
  return {
    webcontainerInstance,
    webcontainerExec: exec,
    startDevServer,
  };
};
