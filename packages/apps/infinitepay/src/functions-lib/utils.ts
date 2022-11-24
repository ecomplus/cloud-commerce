import * as fs from 'fs';
import url from 'url';
import { join as joinPath } from 'path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const readFile = (path: string) => fs.readFileSync(joinPath(__dirname, path), 'utf8');

const readJson = (path: string) => JSON.parse(readFile(path));

const responseError = (status: number | null, error: string, message: string) => {
  return {
    status: status || 409,
    error,
    message: `${message} (lojista deve configurar o aplicativo)`,
  };
};

const isSandbox = true; // TODO: false

export {
  readFile,
  readJson,
  responseError,
  isSandbox,
};
