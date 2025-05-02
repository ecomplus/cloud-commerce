module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
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
    '**/*.md',
    '**/vendor/**',
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
          'mime/lite',
          'image-size/fromFile',
          '@@.*',
          'content/.*',
          '~/.*',
          'photoswipe/lightbox',
          'photoswipe/style.css',
        ],
      },
    ],
    'import/no-named-as-default': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/no-useless-constructor': ['off'],
    'no-nested-ternary': 'warn',
    'no-await-in-loop': 'warn',
    'no-shadow': 'warn',
    'quote-props': ['warn', 'consistent'],
    'comma-dangle': ['warn', 'always-multiline'],
    'quotes': 'warn',
    'max-len': 'warn',
    'semi': 'warn',
    'no-console': 'warn',
    'operator-linebreak': 'warn',
    'max-statements-per-line': ['warn', { max: 3 }],
    'no-empty': 'warn',
    'spaced-comment': 'warn',
    'block-spacing': ['warn', 'always'],
    'no-tabs': 'warn',
    'indent': ['warn', 2, { SwitchCase: 1 }],
    'brace-style': ['warn', '1tbs', { allowSingleLine: true }],
    'no-multi-spaces': ['warn', { ignoreEOLComments: true }],
    'space-before-function-paren': ['warn', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'always',
    }],
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
