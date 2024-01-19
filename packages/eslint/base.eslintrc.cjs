module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: [
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
          'virtual:*',
          'astro:*',
          'uno.css',
          // https://github.com/import-js/eslint-plugin-import/issues/1810
          'firebase-functions/logger',
          'firebase-functions/v2/https',
          'firebase-functions/v1',
          'firebase-admin/app',
          'firebase-admin/firestore',
          'firebase-admin/auth',
          '@astrojs/[^/]+$',
          'astro/config',
          'astro/middleware',
          'unocss/astro',
          'unplugin-auto-import/astro',
          '@@.*',
          'content/.*',
          '~/.*',
          'photoswipe/lightbox',
          'photoswipe/style.css',
        ],
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'no-nested-ternary': 'warn',
    'no-await-in-loop': 'warn',
    'no-shadow': 'warn',
    'quote-props': 'warn',
    'quotes': 'warn',
    'prefer-template': 'off',
    'prefer-destructuring': 'off',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
    'no-continue': 'off',
    'lines-between-class-members': 'off',
    'arrow-body-style': 'off',
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
  overrides: [
    {
      files: ['*.ts', '*.mts', '*.cts', '*.tsx', '*.vue', '*.astro'],
      rules: {
        'no-undef': 'off',
      },
    },
    {
      files: ['*.d.ts'],
      rules: {
        'import/newline-after-import': 'off',
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      },
    },
    {
      files: ['*.config.*', '*.eslintrc.*'],
      rules: {
        'no-console': 'off',
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'quote-props': 'off',
      },
    },
    {
      files: ['*.test.ts', '*.test.mjs', '*.test.cjs'],
      rules: {
        'no-console': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
