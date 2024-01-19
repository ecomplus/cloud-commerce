module.exports = {
  extends: [
    './storefront.eslintrc.cjs',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    'tailwindcss/no-custom-classname': 'off',
  },
};
