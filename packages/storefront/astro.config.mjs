import { fileURLToPath } from 'node:url';
import { lstatSync, readFileSync } from 'node:fs';
import { join as joinPath, relative as relativePath } from 'node:path';
import * as dotenv from 'dotenv';
import { defineConfig, passthroughImageService } from 'astro/config';
import node from '@astrojs/node';
import vue from '@astrojs/vue';
import UnoCSS from 'unocss/astro';
import AstroPWA from '@vite-pwa/astro';
import AutoImport from 'unplugin-auto-import/astro';
import dictionaryDir from '@cloudcommerce/i18n/lib/dirname';
import getConfig from './config/storefront.config.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config();

const isSSG = process.env.BUILD_OUTPUT === 'static';
const outDir = process.env.BUILD_OUT_DIR || (isSSG ? './dist/client' : './dist');
const isToServerless = !isSSG && process.env.DEPLOY_RUNTIME === 'serverless';
const deployRand = process.env.DEPLOY_RAND || '_';
const isLibDev = !(relativePath(__dirname, process.cwd()));

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
    short_name: settings.shortName || settings.name || 'MyShop',
    description: settings.description || 'My PWA Shop',
    background_color: settings.bgColor || '#f5f6fa',
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
    navigateFallback: '/~fallback',
    globDirectory: 'dist/client',
    globPatterns: [],
    globIgnores: ['admin/**/*'],
    ignoreURLParametersMatching: [/.*/],
    runtimeCaching: [{
      urlPattern: /^\/(~fallback)?$/,
      handler: 'NetworkFirst',
    }, {
      urlPattern: /^\/(?!_astro\/|admin\/|assets\/|img\/)/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxAgeSeconds: 86400 * 7,
        },
      },
    }, {
      urlPattern: /^\/_astro\/.*\.(?:js|css)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'hashed-chunks',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400 * 365,
        },
      },
    }, {
      urlPattern: /^\/_astro\/.*\.(?!js|css)\w+$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'hashed-images',
        expiration: {
          maxAgeSeconds: 86400 * 30,
        },
      },
    }, {
      urlPattern: /^\/assets\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'assets',
        expiration: {
          maxAgeSeconds: 86400 * 7,
        },
      },
    }, {
      urlPattern: /^\/img\/uploads\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'cms-images',
        expiration: {
          maxAgeSeconds: 86400 * 7,
          purgeOnQuotaError: true,
        },
      },
    }, {
      urlPattern: /^https:\/\/ecomplus\.io/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'store-api',
        expiration: {
          maxAgeSeconds: 86400 * 7,
        },
      },
    }, {
      urlPattern: /^https:\/\/(((\w+\.)?ecoms\d)|(ecom[\w-]+(\.\w+)*\.digitaloceanspaces))\.com.*\/imgs\/normal\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'product-thumbnails',
        expiration: {
          maxAgeSeconds: 86400 * 30,
          purgeOnQuotaError: true,
        },
      },
    }, {
      urlPattern: /^https:\/\/(((\w+\.)?ecoms\d)|(ecom[\w-]+(\.\w+)*\.digitaloceanspaces))\.com.*\/imgs\/big\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'product-pictures',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400 * 7,
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
  isPWA = false,
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
    AutoImport({
      include: [
        /^(?!@@).*\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /^(?!@@).*\.vue$/, /^(?!@@).*\.vue\?vue/, // .vue
        /^(?!@@).*\.mdx?$/, // .md, .mdx
        /^(?!@@).*\.astro$/,
      ],
      imports: ['vue'],
      dts: isLibDev ? '.auto-imports.d.ts' : false,
    }),
    {
      name: 'client:context',
      hooks: {
        'astro:config:setup': ({ addClientDirective }) => {
          addClientDirective({
            name: 'context',
            entrypoint: joinPath(__dirname, 'config/astro/context-directive.mjs'),
          });
        },
      },
    },
  ];
  if (isPWA && !isSSG) {
    integrations.push(AstroPWA(vitePWAOptions));
  } else {
    viteAlias.push({
      find: 'virtual:pwa-info',
      replacement: joinPath(__dirname, 'config/astro/mock-pwa-info.mjs'),
    }, {
      find: 'virtual:pwa-register',
      replacement: joinPath(__dirname, 'config/astro/mock-pwa-info.mjs'),
    });
  }
  return {
    output: isSSG ? 'static' : 'server',
    adapter: isSSG ? undefined : node({
      mode: 'middleware',
    }),
    outDir,
    integrations,
    image: isToServerless ? { service: passthroughImageService() } : undefined,
    site,
    compressHTML: isToServerless,
    build: {
      assetsPrefix: !isSSG ? settings.assetsPrefix : undefined,
      inlineStylesheets: 'never',
      ...settings.build,
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
