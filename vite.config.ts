/* eslint-disable import/no-extraneous-dependencies */
/// <reference types="vitest" />
// Configure Vitest (https://vitest.dev/config/)

import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    reporters: 'verbose',
  },
});
