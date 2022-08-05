import path from 'path';
import { fs } from 'zx';

const copyFunctionsConfig = async () => {
  const functionsDir = path.join(process.cwd(), 'functions');
  const filesToCopy = ['.env', 'config.json'];
  const dirents = await fs.readdir(functionsDir, { withFileTypes: true });
  for (let i = 0; i < dirents.length; i++) {
    if (dirents[i].isDirectory() && dirents[i].name.charAt(0) !== '.') {
      for (let ii = 0; ii < filesToCopy.length; ii++) {
        const srcPath = path.join(functionsDir, filesToCopy[ii]);
        if (fs.existsSync(srcPath)) {
          // eslint-disable-next-line no-await-in-loop
          await fs.copy(
            srcPath,
            path.join(functionsDir, dirents[i].name, filesToCopy[ii]),
          );
        }
      }
    }
  }
};

export default copyFunctionsConfig;
