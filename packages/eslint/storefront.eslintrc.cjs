module.exports = {
  extends: [
    './base.eslintrc.cjs',
    'plugin:astro/recommended',
  ],
  rules: {
    'no-console': 'off',
    'max-len': 'warn',
    'semi': 'warn',
    'arrow-parens': 'warn',
    'object-curly-newline': 'warn',
    'comma-dangle': 'warn',
    'consistent-return': 'warn',
    'array-bracket-spacing': 'warn',
    'no-restricted-syntax': 'warn',
    'quote-props': 'off',
    'quotes': 'off',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'import/prefer-default-export': 'warn',
    'import/extensions': 'off',
    'vue/multi-word-component-names': ['error', {
      ignores: [
        'Fade',
        'Carousel',
        'Drawer',
        'Skeleton',
        'Prices',
        'Banner',
        'Breadcrumbs',
        'Countdown',
        'Collapse',
        'Accordion',
        'Pagination',
      ],
    }],
  },
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
      rules: {
        'no-await-in-loop': 'off',
        'import/prefer-default-export': 'off',
        'consistent-return': 'off',
        'no-shadow': 'off',
      },
    },
  ],
};
