import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const resolvePath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    // Same as `tsconfig.base.json` paths (and Astro `viteAlias`)
    alias: {
      '@@i18n': resolvePath('./node_modules/@cloudcommerce/i18n/src/pt_br.ts'),
      '@@sf': resolvePath('./src/lib'),
      '~': resolvePath('./src'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
  },
});
