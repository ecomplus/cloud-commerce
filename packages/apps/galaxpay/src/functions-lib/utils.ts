import * as fs from 'node:fs';
import url from 'node:url';
import { join as joinPath } from 'node:path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const readFile = (path: string) => fs.readFileSync(joinPath(__dirname, path), 'utf8');

const responseError = (status: number | null, error: string, message: string) => {
  return {
    status: status || 409,
    error,
    message,
  };
};

const isSandbox = false; // TODO: false

export {
  readFile,
  responseError,
  isSandbox,
};
