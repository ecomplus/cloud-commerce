export const workboxOptions = {
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
};

export default workboxOptions;
