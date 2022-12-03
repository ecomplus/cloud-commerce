module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: [
    'vue',
    '@typescript-eslint',
  ],
  ignorePatterns: [
    '**/dist',
    '**/types/*.d.ts',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  rules: {
    'import/no-unresolved': [
      'error',
      {
        ignore: [
          'firebase-functions/logger',
          'firebase-functions/v2/https',
          'firebase-functions/v1',
          'firebase-admin/app',
          'firebase-admin/firestore',
          'firebase-admin/auth',
          '@astrojs/[^/]+$',
          'astro/config',
          'unocss/astro',
          'unplugin-vue-components/*',
          'unplugin-auto-import/*',
          '@@.*',
          'content/.*',
          '~/.*',
        ],
      },
    ],
    'prefer-template': 'warn',
    'no-nested-ternary': 'warn',
    'no-await-in-loop': 'warn',
    'no-shadow': 'warn',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
    'no-continue': 'off',
    'lines-between-class-members': 'off',
    'arrow-body-style': 'off',
    'vue/no-multiple-template-root': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      { js: 'ignorePackages', ts: 'never' },
    ],
    'padded-blocks': [
      'error',
      'never',
    ],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: ['directive', 'import', 'export'], next: '*' },
      { blankLine: 'always', prev: '*', next: ['directive', 'export'] },
      { blankLine: 'never', prev: 'directive', next: 'directive' },
      { blankLine: 'never', prev: 'import', next: 'import' },
    ],
    'import/order': [
      'error',
      { groups: ['type', 'builtin', 'external', 'parent', 'sibling', 'index'] },
    ],
    'no-plusplus': [
      'error',
      { allowForLoopAfterthoughts: true },
    ],
    'no-multi-spaces': [
      'error',
      { ignoreEOLComments: true },
    ],
  },
};
