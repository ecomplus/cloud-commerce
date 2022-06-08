module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: [
    'vue',
    '@typescript-eslint',
  ],
  ignorePatterns: [
    '**/dist',
  ],
  rules: {
    'no-param-reassign': 'warn',
    'no-await-in-loop': 'warn',
    'no-shadow': 'warn',
    'no-underscore-dangle': 'warn',
    'no-continue': 'off',
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
    'arrow-body-style': 'off',
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
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
};
