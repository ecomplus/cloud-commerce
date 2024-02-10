import type { WebContainer as IWebContainer } from '@webcontainer/api';
import { RepoDatabase } from './indexeddb';

export const genContainerFiles = ({ repo, ghToken }: {
  repo: string,
  ghToken?: string,
}) => ({
  'git.js': {
    file: {
      contents: `
import { join } from 'path';
import { clone } from 'isomorphic-git';
import * as http from 'isomorphic-git/http/node/index.cjs';
import fs from 'node:fs';
const exe = async () => {
  const dir = join(process.cwd(), 'store');
  const gitOptions = {
    fs,
    http,
    dir,
    url: 'https://github.com/${repo}.git',
    singleBranch: true,
    depth: 1,
  };
  ${(ghToken
    ? `
  gitOptions.oauth2format = 'github';
  gitOptions.token = '${ghToken}';`
    : '')}
  await clone(gitOptions);
};
exe();
`,
    },
  },
  'unzipper.js': {
    file: {
      contents: `
import AdmZip from 'adm-zip';
const unzipDirectory = async (inputFilePath, outputDirectory) => {
  const zip = new AdmZip(inputFilePath);
  return new Promise((resolve, reject) => {
    zip.extractAllToAsync(outputDirectory, true, (error) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};
await unzipDirectory('store.zip', 'store');
`,
    },
  },
  'zipper.js': {
    file: {
      contents: `
import AdmZip from 'adm-zip';
const zipDirectory = async (sourceDir, outputFilePath) => {
  const zip = new AdmZip();
  zip.addLocalFolder(sourceDir);
  await zip.writeZipPromise(outputFilePath);
};
await zipDirectory('./store', './store.zip');
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
  "main": "index.js",
  "author": "",
  "license": "ISC",
  "scripts": {
    "start": "nodemon --watch './' index.js",
    "git": "node git.js",
    "unzipper": "node unzipper.js",
    "zipper": "node zipper.js"
  },
  "dependencies": {
    "dotenv": "^16.3.1",
    "adm-zip": "^0.5.10",
    "axios": "^1.6.2",
    "isomorphic-git": "^1.25.2"
  }
}`,
    },
  },
});

export const initWebcontainer = async ({
  repo,
  ghToken,
  WebContainer,
  cliTextarea,
}: {
  repo: string,
  ghToken?: string,
  WebContainer: Record<string, any>,
  cliTextarea: HTMLTextAreaElement,
}) => {
  const webcontainerInstance: IWebContainer = await WebContainer.boot();
  const files = genContainerFiles({ repo, ghToken });
  await webcontainerInstance.mount(files);
  const exec = async (command: string, args: string[]) => {
    const cliArgs = args.reduce((acc, opt) => `${acc} ${opt}`, '');
    const cli = `$ ${command}${cliArgs}\n`;
    cliTextarea.value += cli;
    const cmd = await webcontainerInstance.spawn(command, args);
    cmd.output.pipeTo(new WritableStream({
      write(stdout) {
        console.debug?.('webcontainer', { stdout });
      },
    }));
    if (await cmd.exit !== 0) {
      throw new Error(`${command} failed`);
    }
  };
  await exec('npm', ['install']);
  const startDevServer = async (commitSha?: string) => {
    const repoDatabase = new RepoDatabase(repo);
    const storedRepoZip = commitSha ? await repoDatabase.get(commitSha) : null;
    if (!storedRepoZip) {
      await exec('npm', ['run', 'git']);
      await exec('npm', ['--prefix', 'store', 'i']);
      if (commitSha) {
        await exec('npm', ['run', 'zipper']);
        const repoZip = await webcontainerInstance.fs.readFile('./store.zip');
        repoDatabase.put(commitSha, repoZip);
      }
    }
  };
  return {
    webcontainerInstance,
    webcontainerExec: exec,
    startDevServer,
  };
};
