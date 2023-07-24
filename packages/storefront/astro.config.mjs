import { fileURLToPath } from 'node:url';
import { lstatSync, readFileSync } from 'node:fs';
import { join as joinPath } from 'node:path';
import * as dotenv from 'dotenv';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vue from '@astrojs/vue';
import image from '@astrojs/image';
import UnoCSS from 'unocss/astro';
import AstroPWA from '@vite-pwa/astro';
import dictionaryDir from '@cloudcommerce/i18n/lib/dirname';
import getConfig from './config/storefront.config.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config();

const isSSG = process.env.BUILD_OUTPUT === 'static';
const outDir = process.env.BUILD_OUT_DIR || (isSSG ? './dist/client' : './dist');
const isToServerless = !isSSG && process.env.DEPLOY_RUNTIME === 'serverless';
const deployRand = process.env.DEPLOY_RAND || '_';

const {
  lang,
  domain,
  primaryColor,
  settings,
} = getConfig();

const getIconUrl = (size) => {
  return `/_image?f=png&w=${size}&h=${size}`
    + `&href=${encodeURIComponent(settings.icon)}&V=${deployRand}`;
};

const _vitePWAOptions = {
  manifest: {
    name: settings.name || 'My Shop',
    short_name: settings.short_name || settings.name || 'MyShop',
    description: settings.description || 'My PWA Shop',
    background_color: settings.bg_color || '#f5f6fa',
    theme_color: primaryColor,
    crossorigin: 'use-credentials',
    icons: [{
      src: settings.icon ? getIconUrl(192) : '/img/icon.png',
      sizes: '192x192',
      type: 'image/png',
    }, {
      src: settings.icon ? getIconUrl(512) : '/img/large-icon.png',
      sizes: '512x512',
      type: 'image/png',
    }, {
      src: settings.icon || '/img/large-icon.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    }],
  },
  registerType: 'autoUpdate',
  workbox: {
    navigateFallback: '/404',
    globDirectory: 'dist/client',
    globPatterns: ['**/!(cms*|admin*).{js,css}'],
    globIgnores: ['admin/**/*'],
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
        cacheName: 'optim-images',
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

const viteAlias = [];
if (isToServerless) {
  viteAlias.push({
    find: '@@sf/components/Picture.astro',
    replacement: joinPath(__dirname, 'src/images/Picture.runtime.astro'),
  });
}
viteAlias.push(
  { find: '@@i18n', replacement: `@cloudcommerce/i18n/src/${lang}.ts` },
  { find: '@@sf', replacement: joinPath(__dirname, 'src/lib') },
  { find: '~', replacement: joinPath(process.cwd(), 'src') },
  { find: 'content', replacement: joinPath(process.cwd(), 'content') },
  { find: '/img', replacement: joinPath(process.cwd(), 'public/img') },
  { find: '/assets', replacement: joinPath(process.cwd(), 'public/assets') },
);

const genAstroConfig = ({
  site = `https://${domain}`,
  vitePWAOptions = _vitePWAOptions,
} = {}) => {
  const integrations = [
    vue({
      appEntrypoint: '/src/pages/_vue',
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('d-'),
        },
      },
    }),
    UnoCSS({
      injectReset: false,
      injectEntry: false,
    }),
    AstroPWA(vitePWAOptions),
  ];
  if (!isToServerless) {
    integrations.push(image({
      serviceEntryPoint: '@astrojs/image/sharp',
    }));
  }
  return {
    output: isSSG ? 'static' : 'server',
    adapter: isSSG ? undefined : node({
      mode: 'middleware',
    }),
    outDir,
    integrations,
    site,
    compressHTML: isToServerless,
    build: {
      inlineStylesheets: 'never',
    },
    vite: {
      plugins: [
        {
          name: 'vue-i18n',
          transform(code, id) {
            if (!/\.vue$/.test(id)) {
              return;
            }
            // eslint-disable-next-line consistent-return
            return code.replace(/\$t\.i19([a-z][\w$]+)/g, (match, p1) => {
              try {
                const text = readFileSync(joinPath(dictionaryDir, lang, `i19${p1}.txt`));
                return `'${text}'`;
              } catch (e) {
                console.error(e);
                return match;
              }
            });
          },
        },
      ],
      resolve: {
        preserveSymlinks: lstatSync(joinPath(process.cwd(), 'src/components')).isSymbolicLink(),
        alias: viteAlias,
      },
    },
  };
};

const astroConfig = genAstroConfig();

// https://astro.build/config
export default defineConfig(astroConfig);

export { genAstroConfig, astroConfig };

export const vitePWAOptions = _vitePWAOptions;
