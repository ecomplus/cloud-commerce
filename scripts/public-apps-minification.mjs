import { resolve } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import url from 'url';
import { argv } from 'process';
// eslint-disable-next-line import/no-extraneous-dependencies
import { minify } from 'uglify-js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const app = argv[2];
if (app) {
  const publicPath = resolve(__dirname, `../packages/apps/${app}/assets`);
  readdirSync(publicPath).forEach((file) => {
    if (file.endsWith('.js') && !file.endsWith('.min.js')) {
      const filePath = resolve(publicPath, file);
      if (filePath) {
        const jsContent = minify(readFileSync(filePath, 'utf8')).code;
        writeFileSync(filePath.replace(/.js$/, '.min.js'), jsContent, 'utf8');
      }
    }
  });
}
