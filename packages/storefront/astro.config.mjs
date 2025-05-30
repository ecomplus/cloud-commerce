import { fileURLToPath } from 'node:url';
import { lstatSync, readFileSync } from 'node:fs';
import { join as joinPath, relative as relativePath, basename } from 'node:path';
import * as dotenv from 'dotenv';
import { defineConfig, passthroughImageService } from 'astro/config';
import node from '@astrojs/node';
import vue from '@astrojs/vue';
import UnoCSS from 'unocss/astro';
import AutoImport from 'unplugin-auto-import/astro';
import dictionaryDir from '@cloudcommerce/i18n/lib/dirname';
import getConfig from './config/storefront.config.mjs';
import workboxOptions from './config/astro/workbox-options.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config();

const isSSG = process.env.BUILD_OUTPUT === 'static';
// const isMinimalBuild = !!process.env.BUILD_MINIMAL;
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
  workbox: workboxOptions,
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
  AstroPWA,
  isPWA = true,
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
        'astro:config:setup': ({ addClientDirective, addMiddleware }) => {
          addClientDirective({
            name: 'sf',
            entrypoint: joinPath(__dirname, 'config/astro/client-sf-directive.mjs'),
          });
          addMiddleware({
            entrypoint: joinPath(__dirname, 'config/astro/node-middleware.mjs'),
            order: 'pre',
          });
        },
      },
    },
  ];
  isPWA = isPWA && typeof AstroPWA === 'function';
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
  const buildConfig = {
    assetsPrefix: !isSSG ? settings.assetsPrefix : undefined,
    inlineStylesheets: 'never',
    assets: '_astro',
    ...settings.build,
  };
  return {
    output: isSSG ? 'static' : 'server',
    adapter: isSSG ? undefined : node({
      mode: 'middleware',
    }),
    outDir,
    cacheDir: './.cache/astro',
    integrations,
    prefetch: true,
    image: isToServerless ? { service: passthroughImageService() } : undefined,
    site,
    compressHTML: isToServerless,
    build: buildConfig,
    vite: {
      cacheDir: './.cache/vite',
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
              } catch (err) {
                console.error(err);
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
      define: {
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
      },
      build: {
        rollupOptions: {
          output: {
            entryFileNames: (chunkInfo) => {
              if (chunkInfo.name.includes('hoisted')) {
                const sfScripts = chunkInfo.moduleIds?.filter((id) => {
                  return id.includes('storefront/src/lib/scripts/');
                });
                if (sfScripts?.length === 1) {
                  const scriptName = basename(sfScripts[0], '.ts').replaceAll('.', '');
                  return `${buildConfig.assets}/[name]-${scriptName}.[hash].js`;
                }
              }
              return `${buildConfig.assets}/[name].[hash].js`;
            },
          },
        },
      },
    },
  };
};

const astroConfig = genAstroConfig();

// https://astro.build/config
export default defineConfig(astroConfig);

export { genAstroConfig, astroConfig };

export const vitePWAOptions = _vitePWAOptions;
