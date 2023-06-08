module.exports = {
  extends: './.base.eslintrc.cjs',
  rules: {
    'no-console': 'off',
    semi: 'warn',
    'arrow-parens': 'warn',
    'object-curly-newline': 'warn',
    'comma-dangle': 'warn',
    'quote-props': 'warn',
    'consistent-return': 'warn',
    'array-bracket-spacing': 'warn',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'import/prefer-default-export': 'warn',
    'vue/multi-word-component-names': ['error', {
      ignores: ['Fade', 'Carousel', 'Drawer', 'Prices'],
    }],
  },
};
