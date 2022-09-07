import * as dotenv from 'dotenv';
// https://github.com/import-js/eslint-plugin-import/issues/1810
/* eslint-disable import/no-unresolved */
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vue from '@astrojs/vue';
import partytown from '@astrojs/partytown';
import prefetch from '@astrojs/prefetch';
import sitemap from '@astrojs/sitemap';
import getConfig from './storefront.config.mjs';

dotenv.config();

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node(),
  integrations: [
    vue(),
    partytown(),
    prefetch(),
    sitemap(),
  ],
  site: `https://${getConfig().domain}`,
});
