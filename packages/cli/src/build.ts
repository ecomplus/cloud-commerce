import { join as joinPath } from 'node:path';
import { $, fs } from 'zx';

const copyFunctionsConfig = async (isDev = false) => {
  const functionsDir = joinPath(process.cwd(), 'functions');
  if (isDev && !fs.existsSync(joinPath(functionsDir, '.env'))) {
    try {
      const { storeId } = JSON.parse(
        fs.readFileSync(joinPath(functionsDir, 'config.json'), 'utf8'),
      );
      await fs.writeFile(joinPath(functionsDir, '.env'), `ECOM_STORE_ID=${storeId}\n`);
    } catch {
      //
    }
  }
  const filesToCopy = ['.env', 'config.json', 'ssr/content/settings.json'];
  const dirents = await fs.readdir(functionsDir, { withFileTypes: true });
  for (let i = 0; i < dirents.length; i++) {
    if (dirents[i].isDirectory() && dirents[i].name.charAt(0) !== '.') {
      const codebase = dirents[i].name;
      const codebaseDir = joinPath(functionsDir, codebase);
      // eslint-disable-next-line no-await-in-loop
      await fs.ensureDir(joinPath(codebaseDir, 'content'));
      for (let ii = 0; ii < filesToCopy.length; ii++) {
        const fileToCopy = filesToCopy[ii];
        if (codebase !== 'ssr' || !fileToCopy.includes('ssr/')) {
          const srcPath = joinPath(functionsDir, fileToCopy);
          if (fs.existsSync(srcPath) && srcPath) {
            // eslint-disable-next-line no-await-in-loop
            await fs.copy(
              srcPath,
              joinPath(codebaseDir, fileToCopy.replace('ssr/', '')),
            );
          }
        }
      }
    }
  }
};

const buildCodebase = async (codebase?: string) => {
  copyFunctionsConfig();
  if (codebase === 'ssr') {
    await $`npm --prefix "functions/ssr" run build 2>ssr-build-warns.log &&
      printf '\n--- // ---\n' && cat ssr-build-warns.log`;
  }
};

export default buildCodebase;

export { buildCodebase, copyFunctionsConfig };

export const prepareCodebases = copyFunctionsConfig;
