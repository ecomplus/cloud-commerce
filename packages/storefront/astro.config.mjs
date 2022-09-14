import * as dotenv from 'dotenv';
// https://github.com/import-js/eslint-plugin-import/issues/1810
/* eslint-disable import/no-unresolved */
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vue from '@astrojs/vue';
import image from '@astrojs/image';
import partytown from '@astrojs/partytown';
import prefetch from '@astrojs/prefetch';
import sitemap from '@astrojs/sitemap';
import UnoCSS from 'unocss/astro';
import getConfig from './storefront.config.mjs';

dotenv.config();

const astroConfig = {
  output: 'server',
  adapter: node(),
  integrations: [
    vue(),
    image(),
    partytown(),
    prefetch(),
    sitemap(),
    UnoCSS(),
  ],
  site: `https://${getConfig().domain}`,
};

// https://astro.build/config
export default defineConfig(astroConfig);

export { astroConfig };
