const { ignorePatterns, rules } = require('../../.eslintrc.cjs');

module.exports = {
  extends: '../../.eslintrc.cjs',
  ignorePatterns: [
    ...ignorePatterns,
    '**/vendor',
  ],
  rules: {
    'import/no-unresolved': [
      'error',
      {
        ignore: [
          ...rules['import/no-unresolved'][1].ignore,
          '@storefront-ui/vue',
        ],
      },
    ],
    'no-console': 'off',
    semi: 'warn',
    quotes: 'warn',
    'arrow-parens': 'warn',
    'import/prefer-default-export': 'warn',
  },
};
