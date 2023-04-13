import { resolve } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { minify } from 'uglify-js';

['paypal-checkout', 'spb', 'paypal-plus'].forEach((folder) => {
  const publicPath = resolve(process.cwd(), `assets/${folder}`);
  readdirSync(publicPath).forEach((file) => {
    if (file.endsWith('.js') && !file.endsWith('.min.js')) {
      const filePath = resolve(publicPath, file);
      if (filePath) {
        const minifyFile = minify(readFileSync(filePath, 'utf8'));
        if (minifyFile.code) {
          const outputPath = filePath.replace(/\/([^/]+).js$/, '/$1.min.js');
          writeFileSync(outputPath, minifyFile.code, 'utf8');
        } else {
          // eslint-disable-next-line no-console
          console.error(minifyFile);
        }
      }
    }
  });
});
