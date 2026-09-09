import { fileURLToPath } from 'node:url';
import { join as joinPath } from 'node:path';
import { defineConfig } from 'vitest/config';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: '@@i18n', replacement: '@cloudcommerce/i18n/src/pt_br.ts' },
      { find: '@@sf', replacement: joinPath(__dirname, 'src/lib') },
    ],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
