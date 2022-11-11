import { join as joinPath } from 'node:path';
import { fs } from 'zx';

const copyFunctionsConfig = async () => {
  const functionsDir = joinPath(process.cwd(), 'functions');
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

export default copyFunctionsConfig;
