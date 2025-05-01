module.exports = {
  extends: [
    './base.eslintrc.cjs',
    'plugin:vue/essential',
    'plugin:astro/recommended',
  ],
  rules: {
    'no-console': 'off',
    'class-methods-use-this': 'off',
    'arrow-parens': 'warn',
    'object-curly-newline': 'warn',
    'consistent-return': 'warn',
    'array-bracket-spacing': 'warn',
    'no-restricted-syntax': 'warn',
    'quote-props': 'off',
    'quotes': 'off',
    'global-require': 'off',
    'prefer-rest-params': 'off',
    'import/no-dynamic-require': 'off',
    'import/prefer-default-export': 'warn',
    'import/no-named-default': 'off',
    'import/extensions': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/multi-word-component-names': ['error', {
      ignores: [
        'Fade',
        'Carousel',
        'Drawer',
        'Skeleton',
        'Spinner',
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
      files: ['*.vue', '*.astro'],
      rules: {
        'padding-line-between-statements': 'off',
      },
    },
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
      rules: {
        'no-await-in-loop': 'off',
        'no-case-declarations': 'off',
        'import/prefer-default-export': 'off',
        'consistent-return': 'off',
        'no-shadow': 'off',
      },
    },
  ],
};
