import { existsSync } from 'fs';
import { join as joinPath } from 'path';
import * as dotenv from 'dotenv';
// https://github.com/import-js/eslint-plugin-import/issues/1810
/* eslint-disable import/no-unresolved */
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vue from '@astrojs/vue';
import image from '@astrojs/image';
import partytown from '@astrojs/partytown';
import prefetch from '@astrojs/prefetch';
import UnoCSS from 'unocss/astro';
import { VitePWA } from 'vite-plugin-pwa';
import getConfig from './storefront.config.mjs';

const __dirname = new URL('.', import.meta.url).pathname;
dotenv.config();

const {
  lang,
  domain,
  primaryColor,
  settings,
} = getConfig();

const _vitePWAOptions = {
  manifest: {
    name: settings.name || 'My Shop',
    short_name: settings.short_name || settings.name || 'MyShop',
    description: settings.description || 'My PWA Shop',
    background_color: settings.bg_color || '#ffffff',
    theme_color: primaryColor,
    crossorigin: 'use-credentials',
    icons: [{
      src: settings.icon || '/img/icon.png',
      sizes: '192x192',
      type: 'image/png',
    }, {
      src: settings.large_icon || '/img/large-icon.png',
      sizes: '512x512',
      type: 'image/png',
    }, {
      src: settings.large_icon || '/img/large-icon.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    }],
  },
  registerType: 'autoUpdate',
  workbox: {
    navigateFallback: null,
    globDirectory: 'dist/client',
    globPatterns: ['**/!(cms*|admin*).{js,css}'],
    ignoreURLParametersMatching: [/.*/],
    runtimeCaching: [{
      urlPattern: /^\/$/,
      handler: 'NetworkFirst',
    }, {
      urlPattern: /\/((?!(?:admin|assets|img)(\/|$))[^.]+)(\.(?!js|css|xml|txt|png|jpg|jpeg|webp|avif|svg|gif)[^.]+)*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 50,
          purgeOnQuotaError: true,
        },
      },
    }, {
      urlPattern: /^\/assets\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'assets',
      },
    }, {
      urlPattern: /^\/_image$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'sharp-images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          purgeOnQuotaError: true,
        },
      },
    }, {
      urlPattern: /^\/img\/uploads\/.*\.(?:png|jpg|jpeg|webp|avif|svg|gif)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'cms-images',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          purgeOnQuotaError: true,
        },
      },
    }, {
      urlPattern: /^https:\/\/ecomplus\.io/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'store-api',
        expiration: {
          maxEntries: 50,
          purgeOnQuotaError: true,
        },
      },
    }, {
      urlPattern: /^https:\/\/(((\w+\.)?ecoms\d)|(ecom[\w-]+(\.\w+)*\.digitaloceanspaces))\.com.*\/imgs\/normal\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'product-thumbnails',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          purgeOnQuotaError: true,
        },
      },
    }, {
      urlPattern: /^https:\/\/(((\w+\.)?ecoms\d)|(ecom[\w-]+(\.\w+)*\.digitaloceanspaces))\.com.*\/imgs\/big\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'product-pictures',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          purgeOnQuotaError: true,
        },
      },
    }],
  },
};

const isSSG = process.env.BUILD_OUTPUT === 'static';

// @@components tries ~/components with fallback to @@storefront/components
const localComponentsDir = joinPath(process.cwd(), 'src/components');
const libComponentsDir = joinPath(__dirname, 'src/lib/components');

const genAstroConfig = ({
  site = `https://${domain}`,
  vitePWAOptions = _vitePWAOptions,
} = {}) => ({
  output: isSSG ? 'static' : 'server',
  adapter: isSSG ? undefined : node(),
  outDir: isSSG ? './dist/client' : './dist',
  integrations: [
    image(),
    vue(),
    partytown(),
    prefetch(),
    UnoCSS({
      injectReset: false,
      injectEntry: false,
    }),
  ],
  site,
  vite: {
    plugins: [
      VitePWA(vitePWAOptions),
    ],
    resolve: {
      alias: [
        { find: '@@i18n', replacement: `@cloudcommerce/i18n/src/${lang}.ts` },
        { find: '@@storefront', replacement: joinPath(__dirname, 'src/lib') },
        { find: '~', replacement: joinPath(process.cwd(), 'src') },
        { find: 'content', replacement: joinPath(process.cwd(), 'content') },
        { find: 'public', replacement: joinPath(process.cwd(), 'public') },
        {
          find: '@@components',
          replacement: '',
          customResolver: (componentPath) => {
            const localReplacement = joinPath(localComponentsDir, componentPath);
            if (existsSync(localReplacement)) {
              return localReplacement;
            }
            return joinPath(libComponentsDir, componentPath);
          },
        },
      ],
    },
  },
});

const astroConfig = genAstroConfig();

// https://astro.build/config
export default defineConfig(astroConfig);

export { genAstroConfig, astroConfig };

export const vitePWAOptions = _vitePWAOptions;
