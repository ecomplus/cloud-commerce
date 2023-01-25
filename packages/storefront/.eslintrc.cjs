module.exports = {
  extends: './.base.eslintrc.cjs',
  rules: {
    'no-console': 'off',
    semi: 'warn',
    'arrow-parens': 'warn',
    'object-curly-newline': 'warn',
    'comma-dangle': 'warn',
    'consistent-return': 'warn',
    'array-bracket-spacing': 'warn',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'vue/multi-word-component-names': ['error', {
      ignores: ['Fade', 'Carousel', 'Prices'],
    }],
  },
};
